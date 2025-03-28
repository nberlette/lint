import { wasm, type Range } from "./wasm.ts";

/**
 * Represents a single change to a source file that can be applied by the
 * `deno lint` utility's fix feature.
 *
 * @category Fixes
 */
export interface LintFixChangeLike {
  /** The new text to replace the old text with. */
  readonly newText: string;
  /** The range of the text to replace. */
  readonly range: Range;
}

/**
 * Represents a single change to a source file that can be applied by the
 * `deno lint` utility's fix feature.
 *
 * @category Fixes
 */
export class LintFixChange implements LintFixChangeLike {
  /**
   * Creates a new change from the given change-like object.
   *
   * @param change The change-like object to create the change from.
   * @returns A new `LintFixChange` instance.
   */
  static from(change: LintFixChangeLike): LintFixChange {
    return new LintFixChange(change.newText, change.range);
  }

  /**
   * Constructs a contextual description of the change, based on the range and
   * the replacement text value. If the new text is unreasonably long, it is
   * truncated to 20 characters (this limit can be configured via the second
   * argument).
   *
   * @param change The change to describe.
   * @param [maxLength=20] The maximum length of the new text to include in the
   * description. Defaults to 20 characters. The length of the `ellipsis` is
   * not included in this limit.
   * @param [useBytePos=false] Whether to prefer byte positions over line and
   * column positions. Defaults to false. If true, the description will use the
   * byte positions of the range rather than the line and column numbers.
   * @param [ellipsis] The string to append to the end of the description if
   * the new text is truncated. Defaults to `"... (truncated)".
   * @returns The generated description for the change.
   */
  static getDescription(
    change: LintFixChangeLike,
    maxLength = 20,
    useBytePos = false,
    ellipsis = " ... (truncated)",
  ): string {
    const { newText, range } = change;
    const start = range.start;
    const end = range.end;
    const text = newText.length > maxLength
      ? newText.slice(0, maxLength) + ellipsis
      : newText;
    if (useBytePos) {
      const { bytePos: startBytePos } = start, { bytePos: endBytePos } = end;
      return `Replace bytes ${startBytePos}..${endBytePos} with "${text}"`;
    } else {
      let { line: line1, col: col1 } = start, { line: line2, col: col2 } = end;
      line1 += 1, col1 += 1, line2 += 1, col2 += 1;
      return `Replace lines ${line1}:${col1}..${line2}:${col2} with "${text}"`;
    }
  }

  /**
   * Creates a new change with the given new text and range.
   *
   * @param newText The new text to replace the old text with.
   * @param range The range of the text to replace.
   * @returns A new `LintFixChange` instance.
   */
  constructor(
    /** The new text to replace the old text with. */
    readonly newText: string,
    /** The range of the text to replace. */
    readonly range: Range,
  ) {}

  /**
   * Applies the change to the given source text.
   *
   * @param source The source text to apply the change to.
   * @returns The source text with the change applied.
   */
  apply(source: string, description?: string): string {
    description ??= LintFixChange.getDescription(this);
    return wasm.applyFix(source, { description, changes: [this] });
  }

  /**
   * Returns a JSON representation of the change.
   */
  toJSON(): LintFixChangeLike {
    const { newText, range } = this;
    return { newText, range };
  }

  /**
   * Returns a string representation of the change.
   */
  toString(): string {
    return this.newText;
  }

  /** @internal */
  [Symbol.toPrimitive](): string {
    return this.newText;
  }

  /** @internal */
  get [Symbol.toStringTag](): "LintFixChange" {
    return "LintFixChange";
  }
}

/**
 * Represents a single fix that can be applied by the `deno lint` utility.
 *
 * @category Fixes
 */
export interface LintFixLike {
  /** A short summarizing description of the fix. */
  readonly description: string;
  /** The changes to apply to the source file. */
  readonly changes: LintFixChangeLike[];
}

/**
 * Represents a fix that can be applied by the `deno lint` utility, with
 * a description of the fix and one or more {@linkcode LintFixChange|changes}
 * to apply to the source file.
 *
 * @category Fixes
 */
export class LintFix implements Iterable<LintFixChange>, LintFixLike {
  /**
   * Creates a new fix from the given fix-like object.
   *
   * @param fix The fix-like object to create the fix from.
   * @returns A new `LintFix` instance.
   */
  static from(fix: LintFixLike): LintFix {
    return new LintFix(fix.description, fix.changes.map(LintFixChange.from));
  }

  /**
   * Creates a new fix with the given description and changes.
   *
   * @param description A short summarizing description of the fix.
   * @param changes The changes to apply to the source file.
   * @returns A new `LintFix` instance.
   */
  constructor(
    /** A short summarizing description of the fix. */
    readonly description: string,
    /** The changes to apply to the source file. */
    readonly changes: LintFixChange[],
  ) {}

  /**
   * Applies the first change in the fix to the given source text.
   *
   * Any additional changes in the fix are ignored.
   *
   * @param source The source text to apply the fix to.
   * @returns The source text with the first fix change applied.
   */
  apply(source: string): string {
    const [change] = this.changes, changes = [change];
    return wasm.applyFix(source, { ...this, changes });
  }

  /**
   * Applies all changes for this fix to the given source text. Changes are
   * applied sequentially beginning with the change located last in the source,
   * so that the ranges of the changes do not interfere with each other.
   *
   * If you would like to apply the changes in the order they appear in the
   * original diagnostic reported by the linter, set the `unsorted` option to
   * `true`. This is strongly discouraged, as it increases the likelihood of
   * syntax errors in the resulting source text if any changes overlap.
   *
   * @param source The source text to apply the fix to.
   * @param [unsorted=false] Whether to apply the changes in the order they
   * appear in the fix. Defaults to false.
   * @returns The source text with the fix changes applied.
   */
  applyAll(source: string, unsorted = false): string {
    const changes = this.changes.slice();
    if (!unsorted) changes.sort(wasm.compareChanges);
    return wasm.applyAllChanges(source, { ...this, changes });
  }

  /** Returns a JSON representation of the fix. */
  toJSON(): LintFixLike {
    const { description } = this;
    const changes = this.changes.map((c) => c.toJSON());
    return { description, changes };
  }

  /** Returns a string representation of the fix. */
  toString(): string {
    return this.description;
  }

  /** @internal */
  *[Symbol.iterator](): IterableIterator<LintFixChange> {
    yield* this.changes;
  }

  /** @internal */
  [Symbol.toPrimitive](): string {
    return this.description;
  }

  /** @internal */
  get [Symbol.toStringTag](): "LintFix" {
    return "LintFix";
  }
}
