import { stripAnsiCode } from "@std/fmt/colors";
import { isError } from "@type/is/error";

import { getNoColor, hasConsole } from "./_internal.ts";
import { wasm } from "./wasm.ts";
import { LintFix } from "./fix.ts";
import type { Range } from "./range.ts";
import type { DiagnosticLevel } from "./diagnostic_level.ts";
import type { Tag } from "./tags.ts";
import type { Rule } from "./rules.generated.ts";
import { LintRule } from "./rule.ts";

export interface SourceRange {
  /**
   * The range of the source code `text` that is being referred to. This is
   * represented as a pair of {@linkcode Position} objects, which represent the
   * `start` and `end` of the range relative to the full source code text.
   *
   * @see {@linkcode Range} for the
   */
  readonly range: Range;
  /**
   * The source code text the range refers to. This contains the entire source
   * code text, not just the snippet that the range refers to.
   */
  readonly text: string;
}

/**
 * Represents a highlighted range of a source code snippet.
 *
 * @category Diagnostics
 */
export interface DiagnosticSnippetHighlight {
  /** The severity level of the highlight. */
  readonly level: DiagnosticLevel;
  /** The range of the highlight. */
  readonly range: Range;
}

/**
 * Represents a ranged snippet of part of a source code file's contents,
 * optionally with level-specific highlights for certain ranges. This is useful
 * for displaying context around a diagnostic message.
 *
 * @category Diagnostics
 */
export interface DiagnosticSnippet {
  /** The source code snippet. */
  readonly text: string;
  /** The range of the snippet. */
  readonly range: Range;
  /** The highlights of the snippet. */
  readonly highlights: DiagnosticSnippetHighlight[];
}

/**
 * Represents the location of a diagnostic message in a source code file, with
 * additional metadata about the location.
 *
 * This is intended to provide all of the necessary information needed to
 * locate the underlying cause of the issue in the source code:
 *
 * - the source file specifier (e.g. a file path or module specifier).
 * - the original contents of that source file which caused the diagnostic.
 * - the byte range, relative to the original source contents.
 */
export interface LintDiagnosticRange extends SourceRange {
  /** The file specifier that the diagnostic applies to. */
  readonly path: string;
}

/**
 * Represents a single diagnostic message from the deno lint engine.
 *
 * @category Diagnostics
 */
export interface Diagnostic {
  /** The file specifier that the diagnostic applies to. */
  readonly specifier: string;
  /** The source text the diagnostic refers to. */
  readonly source: string;
  /** The range at which the diagnostic applies. */
  readonly range: Range;

  /** The severity level of the diagnostic. */
  readonly level: DiagnosticLevel;
  /** The diagnostic code. */
  readonly code: Rule;
  /** The diagnostic message. */
  readonly message: string;
  /** Optional hint to help the user resolve the cause of the diagnostic. */
  readonly hint: string | undefined;

  /** The tags associated with the diagnostic's rule, if any. */
  readonly tags: readonly Tag[];
  /** Additional information about the diagnostic. */
  readonly info: readonly string[];
  /** An optional URL to a page with more information about the diagnostic. */
  readonly docs?: string | undefined;

  /** An array of suggested fixes for the diagnostic. */
  readonly fixes?: LintFix[] | undefined;
  /** An optional snippet of the source code that the diagnostic applies to. */
  readonly snippet?: DiagnosticSnippet | undefined;
  /** An optional snippet of the source code with available fixes applied. */
  readonly snippetFixed?: DiagnosticSnippet | undefined;
}

/**
 * Represents a diagnostic message that supports automatic fixes. This is a
 * subtype of the {@linkcode Diagnostic} interface, adding a concrete `fixes`
 * and `snippetFixed` properties.
 *
 * @remarks
 * The latter of the aforementioned fields (`snippetFixed`) may be `undefined`
 * if there are no fixes and no existing fixed snippet for a given diagnostic.
 *
 * @category Diagnostics
 * @tags fixable, fixes
 */
export interface FixableDiagnostic extends Diagnostic {
  /** An array of suggested fixes for the diagnostic. */
  readonly fixes: LintFix[];
  /** The original fixes before any were applied. */
  readonly originalFixes: readonly LintFix[];
  /** The original source code before any fixes were applied. */
  readonly originalSource: string;
  /** An optional snippet of the source code with available fixes applied. */
  readonly snippetFixed: DiagnosticSnippet | undefined;
  /** Whether the diagnostic has any fixes available. */
  isFixable(): this is this & { readonly fixes: [LintFix, ...LintFix[]] };
}

/**
 * Represents a single diagnostic message from the deno lint engine.
 *
 * @category Diagnostics
 */
export class LintDiagnostic<TCode extends Rule = Rule>
  implements FixableDiagnostic {
  // #region static members
  /**
   * Creates a new `LintDiagnostic` instance from a given object.
   *
   * @param obj The object to create the Diagnostic from.
   * @returns A new `LintDiagnostic` instance.
   */
  static from(obj: Diagnostic): LintDiagnostic {
    const diagnostic = new LintDiagnostic(
      obj.specifier,
      obj.range,
      obj.source,
      obj.level,
      obj.code,
      obj.message,
      obj.hint,
      obj.info,
      obj.tags,
      obj.fixes,
      obj.snippet,
      obj.snippetFixed,
      obj.docs,
    );
    diagnostic.#pretty = (obj as Diagnostic & { pretty: string }).pretty;
    return diagnostic;
  }
  // #endregion static members

  // #region private members
  #originalSource: string;
  #originalFixes: readonly LintFix[];
  #rule: LintRule<TCode>;

  #locked = false;
  #pretty = "";
  // #endregion private members

  // #region constructor
  /**
   * Creates a new `LintDiagnostic` instance.
   *
   * @param specifier The file specifier that the diagnostic applies to.
   * @param range The range at which the diagnostic applies.
   * @param source The source of the diagnostic.
   * @param level The severity level of the diagnostic.
   * @param code The diagnostic code.
   * @param message The diagnostic message.
   * @param hint An optional hint that can be displayed to the user to help
   * them resolve the diagnostic.
   * @param info Additional information about the diagnostic.
   * @param tags The tags associated with the diagnostic's rule, if any.
   * @param fixes An array of suggested fixes for the diagnostic.
   * @param snippet An optional snippet of the source code that the diagnostic
   * applies to.
   * @param snippetFixed An optional snippet of the source code with available
   * fixes applied.
   * @param docs An optional URL to a page with more information about
   * the diagnostic.
   * @returns A new `LintDiagnostic` instance.
   */
  constructor(
    readonly specifier: string,
    readonly range: Range,
    readonly source: string,
    readonly level: DiagnosticLevel,
    readonly code: TCode,
    readonly message: string,
    readonly hint: string | undefined,
    readonly info: readonly string[] = [],
    readonly tags: readonly Tag[],
    readonly fixes: LintFix[] = [],
    readonly snippet: DiagnosticSnippet | undefined = undefined,
    readonly snippetFixed: DiagnosticSnippet | undefined = undefined,
    readonly docs: string = undefined!,
  ) {
    this.#rule = LintRule.from(code);
    this.docs ??= this.#rule.docs!;
    if (this.docs == null && this.rule.external) {
      this.docs = `https://docs.deno.com/lint/rules/${this.rule}`;
    }

    this.fixes = fixes.map(LintFix.from);
    this.#originalFixes = Object.freeze(this.fixes.slice());
    this.#originalSource = source;
  }
  // #endregion constructor

  // #region public methods
  /** The {@linkcode LintRule} object associated with the diagnostic. */
  get rule(): LintRule<TCode> {
    return this.#rule;
  }

  /** The original source code before any fixes were applied. */
  get originalSource(): string {
    return this.#originalSource;
  }

  /** The original fixes before any were applied. */
  get originalFixes(): readonly LintFix[] {
    return this.#originalFixes;
  }

  /** The total number of fixes originally reported in the diagnostic. */
  totalFixes(): number {
    return this.originalFixes.length;
  }

  /**
   * The total number of changes available for the diagnostic, across all of
   * the available fixes originally reported by the linter.
   */
  totalChanges(): number {
    return this.originalFixes.reduce((a, b) => a + b.changes.length, 0);
  }

  /**
   * An estimate of the total number of fixes that have been applied to the
   * diagnostic since it was initially reported.
   *
   * **Note**: This is not an actual tally of work that has been performed. It
   * is simply an estimate which is (rather naively) derived from the number of
   * fixes **remaining**, subtracted from the number of fixes that initially
   * were reported by the linter.
   *
   * @remarks
   * The actual number of fixes that have been applied may be slightly more or
   * less than this number, depending on various factors (e.g. whether or not
   * the fixes were sorted prior to application, whether all changes of each
   * fix were just applied or only the first, if the process was interrupted,
   * and so on). Take this number with a grain of salt.
   */
  totalAppliedFixes(): number {
    return this.originalFixes.length - this.fixes.length;
  }

  /**
   * The total number of changes that have been applied to the diagnostic,
   * across all of the fixes that have been applied.
   *
   * @see {@linkcode totalAppliedFixes} for more information on the accuracy
   * and reliability of this metric.
   */
  totalAppliedChanges(): number {
    return this.originalFixes.reduce((a, b) => a + b.changes.length, 0) -
      this.fixes.reduce((a, b) => a + b.changes.length, 0);
  }

  /** Whether the diagnostic has any fixes available. */
  isFixable(): this is this & { readonly fixes: [LintFix, ...LintFix[]] } {
    return this.fixes.length > 0;
  }

  /**
   * Applies all of the available fixes for this diagnostic to the associated
   * source code, returning the fixed source code text. This does not consume
   * changes from the diagnostic, nor does it mutate the diagnostic itself in
   * any way. If you want to apply the fixes to the diagnostic in-place, use
   * the {@linkcode LintDiagnostic.prototype.applyFixes} method instead.
   */
  applyFixesTo(source: string): string {
    try {
      return wasm.applyFixes(source, this.fixes);
    } catch (error) {
      if (isError(error)) {
        // remove internal wasm stack trace frames since they contribute no
        // useful information to the end user
        error.stack = error.stack?.replace(/^.*?wasm:\/\/.+?\n/mg, "");
      }
      throw new Error(`Failed to apply fixes: ${error}`);
    }
  }

  /**
   * Consumes and applies all available fixes for this diagnostic to the source
   * code associated with the diagnostic. Returns a reference to the diagnostic
   * itself, with the `fixed` property set to `true`.
   *
   * ### Avoiding Conflicting Changes
   *
   * During the fixing process, the diagnostic is locked to prevent conflicting
   * changes to its state. If another (concurrent) attempt is made to apply the
   * fixes to the same diagnostic, an error will be thrown.
   *
   * In addition, the fixes are sorted prior to their application to reduce the
   * likelihood of ranges overlapping with one another. This is accomplished by
   * sorting fixes by their overall range, and then by the start of their first
   * change.
   *
   * Fixes are then applied in descending order (i.e. from the end of the
   * source code to the beginning), to avoid shifting the ranges of subsequent
   * fixes. This ensures that no subsequent fix will overlap with ranges of
   * those that were already applied.
   *
   * ### Diagnostic State Changes
   *
   * Following a successful application of lint fixes, the properties `source`
   * and `fixes` will reflect the new state of the diagnostic, containing the
   * updated source code and an empty array of fixes, respectively. To access
   * the original pre-fix source code and the fixes that were applied, you may
   * use the readonly properties `originalSource` and `originalFixes`.
   *
   * @param [allChanges=false] Whether to apply all changes from all fixes in
   * this diagnostic. Defaults to `false`, meaning only the **first** change of
   * each fix will be applied.
   * @param [unsorted=false] Controls whether the fixes and their changes are
   * sorted before being applied. The default is `false`, which means that all
   * fixes **_are_** sorted prior to application. It's usually best to leave
   * this option as `false`; the sorting logic is designed to ensure that no
   * subsequent fixes overlap with ranges of those that were already applied.
   * If you set this option to `true`, the fixes will be applied in the order
   * they were reported by the linter, which may result in potential overlaps
   * in their ranges. Only use this option if you know what you're doing.
   * Defaults to `false`, which means all
   * @returns A reference to the diagnostic itself, with the `fixed` property
   * set to `true` and the `source` and `fixes` properties updated.
   * @throws {Error} If the diagnostic is already locked from another attempt
   * to apply its fixes being made at the same time.
   * @throws {Error} If a fix fails to apply to the source code.
   */
  applyFixes(
    allChanges?: boolean,
    unsorted?: boolean,
  ): this & { readonly fixed: true } {
    if (this.#locked) throw new Error("Diagnostic has already been locked");
    this.#locked = true;
    try {
      let source = this.#originalSource;
      const fixes = this.fixes;
      if (!unsorted) fixes.sort(wasm.compareFixes);
      let index = 0;
      while (fixes.length > 0) {
        const fix = fixes.shift();
        index++;
        if (fix) {
          let code = source;
          const range = fix.changes[0]?.range;
          try {
            if (allChanges) {
              source = fix.applyAll(source, unsorted);
            } else {
              source = fix.apply(source);
            }
          } catch (cause) {
            const lines = code.split(/\r?\n/g);
            const line1 = range?.start.line, line2 = range?.end.line;
            const col1 = range?.start.col, col2 = range?.end.col;
            code = lines.slice(Math.max(0, line1 - 2), line2 + 2).map(
              (l, i) =>
                `  \x1b[38;5;33m${String(i + line1 + 1).padStart(4)} |\x1b[m ${
                  l.replace(
                    new RegExp(`^(.{${col1}})(.{${col2 - col1},})$`, "g"),
                    (_, $1, $2) => `\x1b[2m${$1}\x1b[m\x1b[4;93m${$2}\x1b[m`,
                  )
                }`,
            ).join("\n");

            if (getNoColor()) code = stripAnsiCode(code);
            throw new Error(
              `Failed to apply fix "${fix.description}" (#${index}).\n\n` +
                `Source code prior to fix:\n\n${code}\n`,
              { cause },
            );
          }
        } else break;
      }
      Object.assign(this, { source });
      return this as this & { readonly fixed: true };
    } finally {
      this.#locked = false;
    }
  }

  /** The original source code before any fixes were applied. */
  toJSON(): Diagnostic {
    return {
      specifier: this.specifier,
      range: this.range,
      source: this.source,
      level: this.level,
      code: this.code,
      message: this.message,
      hint: this.hint,
      info: this.info,
      tags: this.tags,
      fixes: this.fixes,
      snippet: this.snippet,
      snippetFixed: this.snippetFixed,
      docs: this.docs,
    };
  }

  /**
   * Renders the diagnostic as a pretty-printed string. If `noColor` is `true`,
   * the output will not contain any ANSI color codes. Otherwise, the output
   * will be colorized according to the diagnostic's severity level.
   *
   * The output follows the same format as the `deno lint` CLI output, which is
   * itself inspired by the output of the `rustc` compiler. An example output
   * might look like this:
   *
   * ```sh
   * error[no-unused-vars]: `end` is never used
   *    --> /workspaces/iterable/tools/dlint/src/diagnostic.ts:173:20
   *     |
   * 173 |     const { start, end } = range;
   *     |                    ^^^
   *     = hint: If this is intentional, prefix it with an underscore like `_end`
   *
   *   docs: https://docs.deno.com/lint/rules/no-unused-vars
   * ```
   */
  toString(noColor?: boolean): string {
    noColor ??= getNoColor();
    const pretty = this.#pretty;
    return noColor ? stripAnsiCode(pretty) : pretty;
  }

  toPrettyText(): string {
    return this.toString();
  }

  toPlainText(): string {
    return this.toString(true);
  }

  /**
   * Prints the serialized diagnostic to the console, if one is available in
   * the current runtime environment.
   *
   * By default the serialized string will have ANSI color codes applied to it,
   * unless the `noColor` option is set to `true`, or the environment has
   * indicated that color codes should not be used (e.g. by setting the
   * `NO_COLOR` environment variable).
   *
   * The default output channel is `console.log` (which writes to `stdout` in
   * an environment like Node or Deno). If you want to print to `s
   */
  print(noColor?: boolean, stderr?: boolean): void {
    // only print to console if it is available
    const channel = stderr ? "error" : "log";
    if (hasConsole()) console[channel](this.toString(noColor));
  }

  // #endregion public methods
}
