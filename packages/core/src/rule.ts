/**
 * This module provides the {@linkcode LintRule} class, which represents a
 * single linting rule within the `deno lint` utility.
 *
 * @module rule
 */
import { isPlainObject } from "@type/is/plain-object";

import { wasm } from "./wasm.ts";
import { type Rule, Tag } from "./rules.generated.ts";
import type { LintDiagnostic } from "./diagnostic.ts";
import type { InputType, LinterConfig, RulesConfig } from "./types.ts";
import { Linter } from "./linter.ts";

export type ExternalLinterCallback<TCode extends Rule = Rule> = {
  (source: string, specifier?: string | URL): LintDiagnostic[];
};

/**
 * Represents a single linting rule within the `deno lint` utility,
 * including its name, description, and associated tags, as well as
 * methods for checking if the rule is enabled and for running the
 * lint rule on a given piece of source code.
 *
 * @category Core
 * @tags rule
 */
export class LintRule<TCode extends Rule = Rule> {
  static readonly #registry = new Map<Rule, LintRule<any>>();

  /**
   * Returns an iterable of all available lint rules.
   */
  static *all(): IterableIterator<LintRule> {
    for (const code of LintRule.allCodes()) yield LintRule.from(code);
  }

  /**
   * Returns an iterable of all available lint {@linkcode Rule} codes.
   */
  static *allCodes(): IterableIterator<Rule> {
    yield* wasm.getAllRules() as Rule[];
  }

  /**
   * Returns an iterable of all available lint {@linkcode Tag}s.
   */
  static *allTags(): IterableIterator<Tag> {
    yield* Tag.getAllTags() as Tag[];
  }

  /**
   * Creates a new `LintRule` instance from the specified code or existing
   * `LintRule`-like object. This is useful for mapping a potentially mixed
   * collection of lint rule codes and instances into normalized `LintRule`s.
   *
   * If the rule has already been instantiated, the cached singleton instance
   * will be returned from the internal registry. Otherwise, a new instance
   * will be created and registered before being returned.
   *
   * @param rule Unique identifier for a lint rule, or `LintRule`-like object.
   * @returns A `LintRule` instance.
   */
  static from<TCode extends Rule>(rule: TCode | { code: TCode }): LintRule<TCode> {
    const code = LintRule.isRule(rule)
    return new LintRule(code);
  }

  /**
   * Returns an array of `LintRule` instances representing all of the rules
   * associated with a given {@linkcode Tag}.
   *
   * @param tag - The tag to get rules for.
   * @returns An array of `LintRule` instances.
   */
  static fromTag<T extends Tag>(tag: T): LintRule<Rule.FromTag<T>>[] {
    return wasm.getRules([tag]).map((code) =>
      new LintRule(code as Rule.FromTag<T>)
    );
  }

  /**
   * Returns an array of all available lint rules. This is a convenience
   * wrapper of {@linkcode all} that returns an array instead of an iterable.
   */
  static getAll(): LintRule[] {
    return [...LintRule.all()];
  }

  /**
   * Returns an array of all available lint {@linkcode Rule} codes. This is a
   * convenience wrapper of {@linkcode allCodes} that returns an array instead
   * of an iterable.
   */
  static getAllCodes(): Rule[] {
    return [...LintRule.allCodes()];
  }

  /**
   * Returns an array of all available lint {@linkcode Tag}s. This is a
   * convenience wrapper of {@linkcode allTags} that returns an array instead
   * of an iterable.
   */
  static getAllTags(): Tag[] {
    return [...LintRule.allTags()];
  }

  /**
   * Gets the tags associated with a given {@linkcode Rule} code.
   */
  static getTags<TCode extends Rule>(code: TCode): Tag[];
  /**
   * Gets the tags associated with a given {@linkcode LintRule} instance.
   */
  static getTags<TCode extends Rule>(rule: LintRule<TCode>): Tag[];
  /**
   * Gets the tags associated with a given {@linkcode Rule} code or
   * {@linkcode LintRule} instance.
   */
  static getTags<T extends Rule>(codeOrRule: T | LintRule<T>): Tag[];
  /** @internal */
  static getTags(codeOrRule: Rule | LintRule): Tag[] {
    const code = codeOrRule instanceof LintRule ? codeOrRule.code : codeOrRule;
    return wasm.getTags([code]) as Tag[];
  }

  /**
   * Checks if a given object is an instance of {@linkcode LintRule}. Returns
   * `true` if it is, and `false` otherwise.
   *
   * @param rule - The object to check.
   * @returns `true` if the object is an instance of {@linkcode LintRule}.
   */
  static is<TCode extends Rule>(rule: unknown): rule is LintRule<TCode> {
    return typeof rule === "object" && rule !== null && #external in rule;
  }

  /**
   * Checks if a given string is a valid lint {@linkcode Rule} code supported
   * by this version of the `deno lint` utility. Returns `true` if it is, and
   * `false` otherwise.
   *
   * @param rule - The code to check.
   * @returns `true` if the code is a valid lint rule code, `false` otherwise.
   */
  static isRule(rule: string | null | undefined): rule is Rule;
  /**
   * Checks if an object is a valid {@linkcode LintRule} instance, optionally
   * verifying its code against a specific {@linkcode Rule} code.
   *
   * @param rule - The object to check.
   * @param [code] - The optional code to check against.
   * @returns `true` if the object is a valid lint rule, `false` otherwise.
   */
  static isRule<TCode extends Rule>(
    rule: { code: TCode } | object | null | undefined,
    code?: TCode,
  ): rule is LintRule<TCode>;
  /** @internal */
  static isRule(rule: unknown, code?: Rule): rule is Rule | LintRule;
  /** @internal */
  static isRule(rule: unknown, code?: Rule): rule is Rule | LintRule {
    if (typeof code !== "undefined") {
      if (!LintRule.getAllCodes().includes(code)) return false;
    }
    if (typeof rule === "object" && rule !== null) {
      return #external in rule && (!code || rule.code === code);
    }
    return LintRule.getAllCodes().includes(rule as Rule);
  }

  /**
   * Checks if a given value is a valid {@linkcode Rule} code string. This
   * method is used to validate rule codes that are built-in to the linter
   * engine before they are passed into the underlying WebAssembly module.
   *
   * @param rule - The value to check.
   * @returns `true` if the value is a valid rule code, `false` otherwise.
   * @example
   * ```ts
   * import { LintRule } from "@nick/lint";
   *
   * console.assert(LintRule.isCode("no-unused-vars"));
   * console.assert(!LintRule.isCode("foo-bar"));
   * console.assert(!LintRule.isCode(123));
   * ```
   */
  static isCode(rule: unknown): rule is Rule {
    return typeof rule === "string" && LintRule.getAllCodes().includes(rule as Rule);
  }

  /**
   * Checks if a given value is a valid {@linkcode Tag} string.
   *
   * @param tag - The value to check.
   * @returns `true` if the value is a valid tag, `false` otherwise.
   */
  static isTag(tag: unknown): tag is Tag {
    return typeof tag === "string" && LintRule.getAllTags().includes(tag as Tag);
  }

  /**
   * Checks if a given object is an external lint rule. Returns `true` if it
   * is, and `false` otherwise.
   *
   * @param rule - The object to check.
   * @returns `true` if the object is an external lint rule, `false` otherwise.
   */
  static isExternal<TCode extends Rule>(
    rule: LintRule<TCode>,
  ): rule is LintRule<TCode> & { readonly external: true } {
    return LintRule.is(rule) && !LintRule.isRule(rule.code);
  }

  #external?: boolean;

  /**
   * The unique identifier for the lint rule.
   *
   * @example "no-unused-vars"
   */
  readonly code: TCode;

  /**
   * The tags associated with the lint rule, if any. Tags are used to group
   * rules by category or purpose, allowing users to filter and enable or
   * disable multiple rules at once.
   *
   * @example ["recommended"]
   */
  readonly tags: Tag[] = [];

  /**
   * The priority level of the lint rule. Lower priority levels indicate
   * more important rules that should be addressed first.
   *
   * @default {0}
   */
  readonly priority: number = 0;

  /**
   * Additional information about the lint rule (optional). This will be shown
   * underneath the rule's hint and snippet in the formatted output. Each item
   * in the array will be displayed on a new line.
   *
   * @default {[]}
   */
  readonly info: readonly string[] = [];

  /**
   * An external link to the documentation for this lint rule (optional). For
   * built-in rules from the `deno_lint` engine, this will default to a URL
   * following this format: `https://docs.deno.com/lint/rules/{code}`.
   *
   * @default {undefined}
   */
  readonly docs: string | undefined;

  // TODO(nberlette): implement external linter callback support
  // /**
  //  * **For custom (external) rules only**: a custom callback function invoked
  //  * by the linter engine to generate diagnostics for a string of source code.
  //  *
  //  * This will be called with the source code text for its first argument. It
  //  * may also be passed a file specifier, but there is no guarantee that one
  //  * will be present on each run.
  //  *
  //  * External rules that do not provide a callback will be ignored.
  //  *
  //  * The rule should process the source code in a **synchronous** manner and
  //  * return an array of {@linkcode Diagnostic}s to be included in the final
  //  * report, each representing a single issue in the source code. If no errors
  //  * or warnings were found, an empty array should be returned. No other type
  //  * of value may be returned.
  //  *
  //  * Each diagnostic should be a plain object with the following properties:
  //  *
  //  * - `code`: The rule code (string).
  //  * - `message`: The message to display for the issue (string).
  //  * - `hint`: A hint to help the user fix the issue (optional).
  //  * - `docs_url`: An external link to the documentation for this rule (optional).
  //  * - `level`: The severity level of the issue (`"error"` or `"warning"`)
  //  * - `tags`: An array of tags associated with the issue (optional).
  //  * - `fixes`: An array of suggested fixes for the issue (optional).
  //  * - `snippet`: A code snippet showing the issue (optional).
  //  * - `range`: The range of the source code the diagnostic applies to (optional).
  //  *   - `start`: The starting position of the issue (number).
  //  *     - `line`: The 0-based starting line number (number).
  //  *     - `col`: The 0-based starting column number (number).
  //  *     - `byte_pos`: The 1-based byte position of the issue (number).
  //  *   - `end`: The ending position of the issue (optional).
  //  *     - `line`: The 0-based ending line number (number).
  //  *     - `col`: The 0-based ending column number (number).
  //  *     - `byte_pos`: The 1-based byte position of the issue (number).
  //  *   > Note: Diagnostics without a range represent an file-wide issue.
  //  *
  //  * **Important**: Custom linter callbacks **MUST NEVER** throw an error. The
  //  * `deno_lint` engine operates on the assumption and expectation that these
  //  * callbacks are infallible, and have handled any possible errors internally.
  //  * If an error is thrown, `deno_lint` will panic and the application will
  //  * without a doubt end up crashing.
  //  *
  //  * **Note**: This option applies to custom external `LintRule` instances
  //  * only. It is ignored on all of the built-in `deno lint` rules.
  //  */
  // readonly callback?: ExternalLinterCallback<TCode> | undefined;

  /**
   * Indicates whether the rule is an external rule.
   *
   * @default {false}
   */
  get external(): boolean {
    return this.#external ??= LintRule.isExternal(this);
  }

  /**
   * Creates a new `LintRule` instance with the specified code.
   *
   * @remarks
   * Rule instances are singletons, meaning only one instance of a given rule
   * can exist at any point in time. If the code already exists in the internal
   * registry, a reference to its cached instance will be returned. Otherwise,
   * a new instance will be created and returned, as well as registered in the
   * internal registry.
   */
  constructor(code: TCode) {
    this.code = code;
    if (LintRule.isRule(code)) {
      this.docs ??= `https://docs.deno.com/lint/rules/${this.code}`;
      this.tags = LintRule.getTags(code);
      // TODO(nberlette): implement rule priorities
      // this.priority = wasm.getRulePriority(code);
    }

    if (LintRule.#registry.has(code)) {
      return LintRule.#registry.get(code)!;
    }

    LintRule.#registry.set(code, this);
  }

  /**
   * Checks if the lint rule is enabled in the current configuration.
   *
   * @param config - The configuration object to check against.
   * @returns `true` if the rule is enabled, `false` otherwise.
   */
  isEnabled(config: RulesConfig): boolean {
    const { tags, exclude, include } = config;
    return wasm.getRules(tags, exclude, include).includes(this.code);
  }

  /**
   * Runs the lint rule on the given source code and returns an array of
   * diagnostic messages.
   *
   * @param source The source code to lint, either as a string or a
   * `BufferSource` object. If a `BufferSource` is provided, it will be
   * decoded to a string prior to linting.
   * @param [config] Optional configuration object for the linter.
   * @returns An array of {@linkcode LintDiagnostic} objects generated by this
   * lint rule. If no diagnostics are found, an empty array will be returned.
   * @throws {TypeError} if the `source` is not a string or `BufferSource`.
   * @throws {TypeError} if the `config` is not an object.
   */
  run(source: InputType, config?: LinterConfig): LintDiagnostic[];
  run(
    source: InputType,
    specifier: string | URL,
    config?: Omit<LinterConfig, "specifier">,
  ): readonly LintDiagnostic[];
  run(
    source: InputType,
    specifierOrConfig?: string | URL | LinterConfig,
    config?: LinterConfig,
  ): readonly LintDiagnostic[] {
    if (
      typeof specifierOrConfig === "string" ||
      /* TODO(nberlette): replace with isURL(specifierOrConfig) */
      specifierOrConfig instanceof URL ||
      specifierOrConfig == null
    ) {
      config = { ...config, specifier: specifierOrConfig };
    } else if (isPlainObject(specifierOrConfig)) {
      config = { ...config, ...specifierOrConfig };
    } else {
      throw new TypeError(
        `Invalid arguments. Expected a string, URL, or LinterConfig for arg ` +
          `at index 1, but received ${typeof specifierOrConfig}${
            specifierOrConfig == null ? "" : ": " + specifierOrConfig
          }`,
      );
    }

    return Linter.default.lint(source, { linter: config });
  }

  /**
   * Returns a JSON representation of this `LintRule` instance.
   */
  toJSON(): {
    code: TCode;
    tags: Tag[];
    priority: number;
    info: readonly string[];
    docs: string | undefined;
  } {
    const { code, tags, priority, info, docs } = this;
    return { code, tags, priority, info, docs };
  }

  /**
   * Returns a string representation of this `LintRule` instance, in the form
   * of its unique {@linkcode Rule} code.
   */
  toString(): TCode {
    return this.code;
  }
}
