// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file

/**
 * Returns the version of the `deno_lint` crate used to build this module.
 */
export function deno_lint_version(): string;
/**
 * Lints the given source code, returning an object with the following public
 * properties:
 *
 * - `specifier` (string): The name of the file being linted.
 * - `media_type` (string): The media type of the file being linted.
 * - `text` (string): The source code being linted.
 * - `config` (LinterOptions): The linter configuration.
 * - `diagnostics` (Array<LintDiagnostic>): An array of lint diagnostics.
 * - `errors` (Array<LintDiagnostic>): An array of parse errors.
 *
 * @param {string} code The source code to lint.
 * @param {string} [maybe_filename] The name of the file being linted.
 * @param {string[]} [maybe_tags] An array of rule tags to enable.
 * @param {string[]} [maybe_exclude] An array of rule codes to exclude.
 * @param {string[]} [maybe_include] An array of rule codes to include.
 * @param {string} [maybe_custom_ignore_file_directive] The custom ignore file directive.
 * @param {string} [maybe_custom_ignore_diagnostic_directive] The custom ignore diagnostic directive.
 * @returns {LintDiagnostics} The lint diagnostics and/or parse errors.
 */
export function lint(
  code: string,
  maybe_filename?: string | null,
  maybe_tags?: string[] | null,
  maybe_exclude?: string[] | null,
  maybe_include?: string[] | null,
  maybe_custom_ignore_file_directive?: string | null,
  maybe_custom_ignore_diagnostic_directive?: string | null,
  maybe_default_jsx_factory?: string | null,
  maybe_default_jsx_fragment_factory?: string | null,
): any;
/**
 * Reads the files at the provided paths, lints their code, and attempts to
 * apply any available fixes to files that report fixable diagnostics. The
 * fixed code is not written back to the filesystem, and is only returned in
 * the results object for further inspection/processing.
 *
 * The function returns an array of `LintDiagnostic` objects. Each object
 * represents the lint results for a single file specifier.
 *
 * @param {string[]} targets An array of file specifiers to lint and fix.
 * @param {string[]} [maybe_tags] An array of rule tags to enable.
 *  If omitted, all rules will be included, with respect to `maybe_exclude`
 *  and `maybe_include`. If this is an empty array, no rules are enabled by
 *  default unless they are specified in `maybe_include`.
 * @param {string[]} [maybe_exclude] An array of rule codes to exclude.
 * @param {string[]} [maybe_include] An array of rule codes to include.
 *  Takes priority over `maybe_exclude`.
 * @param {string} [maybe_custom_ignore_file_directive] The custom ignore
 *  file directive. Defaults to `"deno-lint-ignore-file"`.
 * @param {string} [maybe_custom_ignore_diagnostic_directive] The custom
 *  ignore diagnostic directive. Defaults to `"deno-lint-ignore"`.
 * @param {string} [maybe_default_jsx_factory] The default JSX factory.
 *  Defaults to `"React.createElement"`. Only used in JSX files.
 * @param {string} [maybe_default_jsx_fragment_factory] The default JSX
 *  fragment factory. Defaults to `"React.Fragment"`. Only used in JSX files.
 * @returns {FixFilesResults} The results of the fix operation.
 */
export function fixFiles(
  targets: string[],
  maybe_tags?: string[] | null,
  maybe_exclude?: string[] | null,
  maybe_include?: string[] | null,
  maybe_custom_ignore_file_directive?: string | null,
  maybe_custom_ignore_diagnostic_directive?: string | null,
  maybe_default_jsx_factory?: string | null,
  maybe_default_jsx_fragment_factory?: string | null,
): any;
/**
 * Reads the files at the provided paths, lints their code, and attempts to
 * apply available fixes to all files that have fixable diagnostics. The
 * fixed code is written back to the filesystem in place.
 *
 * The function returns an array of `LintDiagnostic` objects. Each object
 * represents the lint results for a single file specifier.
 *
 * @param {string[]} targets An array of file specifiers to lint and fix.
 * @param {string[]} [maybe_tags] An array of rule tags to enable.
 *  If omitted, all rules will be included, with respect to `maybe_exclude`
 *  and `maybe_include`. If this is an empty array, no rules are enabled by
 *  default unless they are specified in `maybe_include`.
 * @param {string[]} [maybe_exclude] An array of rule codes to exclude.
 * @param {string[]} [maybe_include] An array of rule codes to include.
 *  Takes priority over `maybe_exclude`.
 * @param {string} [maybe_custom_ignore_file_directive] The custom ignore
 *  file directive. Defaults to `"deno-lint-ignore-file"`.
 * @param {string} [maybe_custom_ignore_diagnostic_directive] The custom
 *  ignore diagnostic directive. Defaults to `"deno-lint-ignore"`.
 * @param {string} [maybe_default_jsx_factory] The default JSX factory.
 *  Defaults to `"React.createElement"`. Only used in JSX files.
 * @param {string} [maybe_default_jsx_fragment_factory] The default JSX
 *  fragment factory. Defaults to `"React.Fragment"`. Only used in JSX files.
 * @returns {FixFilesResults} The results of the fix operation.
 */
export function fixFilesInPlace(
  targets: string[],
  maybe_tags?: string[] | null,
  maybe_exclude?: string[] | null,
  maybe_include?: string[] | null,
  maybe_custom_ignore_file_directive?: string | null,
  maybe_custom_ignore_diagnostic_directive?: string | null,
  maybe_default_jsx_factory?: string | null,
  maybe_default_jsx_fragment_factory?: string | null,
): any;
/**
 * Lints the given file specifier, returning a `LintDiagnostics` object.
 *
 * @param {string} specifier The file specifier to lint.
 * @param {string[]} [maybe_tags] An array of rule tags to enable.
 *  If omitted, all rules will be included, with respect to `maybe_exclude`
 *  and `maybe_include`. If this is an empty array, no rules are enabled by
 *  default unless they are specified in `maybe_include`.
 * @param {string[]} [maybe_exclude] An array of rule codes to exclude.
 * @param {string[]} [maybe_include] An array of rule codes to include.
 *  Takes priority over `maybe_exclude`.
 * @param {string} [maybe_custom_ignore_file_directive] The custom ignore
 *  file directive. Defaults to `"deno-lint-ignore-file"`.
 * @param {string} [maybe_custom_ignore_diagnostic_directive] The custom
 *  ignore diagnostic directive. Defaults to `"deno-lint-ignore"`.
 * @param {string} [maybe_default_jsx_factory] The default JSX factory.
 *  Defaults to `"React.createElement"`. Only used in JSX files.
 * @param {string} [maybe_default_jsx_fragment_factory] The default JSX
 *  fragment factory. Defaults to `"React.Fragment"`. Only used in JSX files.
 * @returns {LintDiagnostics} The lint diagnostics.
 */
export function lintFile(
  specifier: string,
  maybe_tags?: string[] | null,
  maybe_exclude?: string[] | null,
  maybe_include?: string[] | null,
  maybe_custom_ignore_file_directive?: string | null,
  maybe_custom_ignore_diagnostic_directive?: string | null,
  maybe_default_jsx_factory?: string | null,
  maybe_default_jsx_fragment_factory?: string | null,
): any;
/**
 * Reads the files at the provided paths, lints their code, and returns an
 * array of `LintDiagnostic` objects. Each object represents the lint results
 * for a single file specifier.
 *
 * @param {string[]} specifiers An array of file specifiers to lint.
 * @param {string[]} [maybe_tags] An array of rule tags to enable.
 *  If omitted, all rules will be included, with respect to `maybe_exclude`
 *  and `maybe_include`. If this is an empty array, no rules are enabled by
 *  default unless they are specified in `maybe_include`.
 * @param {string[]} [maybe_exclude] An array of rule codes to exclude.
 * @param {string[]} [maybe_include] An array of rule codes to include.
 *  Takes priority over `maybe_exclude`.
 * @param {string} [maybe_custom_ignore_file_directive] The custom ignore
 *  file directive. Defaults to `"deno-lint-ignore-file"`.
 * @param {string} [maybe_custom_ignore_diagnostic_directive] The custom
 *  ignore diagnostic directive. Defaults to `"deno-lint-ignore"`.
 * @param {string} [maybe_default_jsx_factory] The default JSX factory.
 *  Defaults to `"React.createElement"`. Only used in JSX files.
 * @param {string} [maybe_default_jsx_fragment_factory] The default JSX
 *  fragment factory. Defaults to `"React.Fragment"`. Only used in JSX files.
 * @returns {Array<LintDiagnostics>} An array of lint diagnostics.
 */
export function lintFiles(
  specifiers: string[],
  maybe_tags?: string[] | null,
  maybe_exclude?: string[] | null,
  maybe_include?: string[] | null,
  maybe_custom_ignore_file_directive?: string | null,
  maybe_custom_ignore_diagnostic_directive?: string | null,
  maybe_default_jsx_factory?: string | null,
  maybe_default_jsx_fragment_factory?: string | null,
): any;
/**
 * Lints the given directory and returns an array of `LintDiagnostics` objects
 * representing the results for each file in the directory. Symbolic links are
 * always skipped.
 *
 * For performance reasons, only files in the top-level of the directory are
 * considered by default. If you wish to recursively lint files in a
 * directory, and are fully aware of the severe performance implications, you
 * can set the `maybe_recursive` parameter to `true`.
 *
 * Files are matched based on their extension, which can be customized by
 * providing an array of extensions to the `maybe_exts` parameter. The default
 * extensions are `["js", "jsx", "ts", "tsx", "mjs", "cjs"]`.
 *
 * @param {string} directory The path to the directory to lint.
 * @param {boolean} [maybe_recursive] Whether to recursively lint files in
 * subdirectories.
 * @param {string[]} [maybe_exts] An array of file extensions to lint.
 *  Defaults to `["js", "jsx", "ts", "tsx", "mjs", "cjs"]`.
 * @param {string[]} [maybe_tags] An array of rule tags to enable.
 *  If omitted, all rules will be included, with respect to `maybe_exclude`
 *  and `maybe_include`. If this is an empty array, no rules are enabled by
 *  default unless they are specified in `maybe_include`.
 * @param {string[]} [maybe_exclude] An array of rule codes to exclude.
 * @param {string[]} [maybe_include] An array of rule codes to include.
 *  Takes priority over `maybe_exclude`.
 * @param {string} [maybe_custom_ignore_file_directive] The custom ignore
 *  file directive. Defaults to `"deno-lint-ignore-file"`.
 * @param {string} [maybe_custom_ignore_diagnostic_directive] The custom
 *  ignore diagnostic directive. Defaults to `"deno-lint-ignore"`.
 * @param {string} [maybe_default_jsx_factory] The default JSX factory.
 *  Defaults to `"React.createElement"`. Only used in JSX files.
 * @param {string} [maybe_default_jsx_fragment_factory] The default JSX
 *  fragment factory. Defaults to `"React.Fragment"`. Only used in JSX files.
 * @returns {Array<LintDiagnostics>} An array of lint diagnostics.
 */
export function lintFolder(
  directory: string,
  maybe_recursive?: boolean | null,
  maybe_exts?: string[] | null,
  maybe_tags?: string[] | null,
  maybe_exclude?: string[] | null,
  maybe_include?: string[] | null,
  maybe_custom_ignore_file_directive?: string | null,
  maybe_custom_ignore_diagnostic_directive?: string | null,
  maybe_default_jsx_factory?: string | null,
  maybe_default_jsx_fragment_factory?: string | null,
): any;
/**
 * Get the rule codes associated with the given filter options.
 *
 * @param {string[]} [maybe_tags] An array of rule tags to enable. If
 * omitted, all rules will be included. If empty, no rules will be included.
 * @param {string[]} [maybe_exclude] An array of rule codes to exclude.
 * @param {string[]} [maybe_include] An array of rule codes to include.
 * Takes priority over `maybe_exclude`.
 * @returns {string[]} An array of rule codes.
 */
export function getRules(
  maybe_tags?: string[] | null,
  maybe_exclude?: string[] | null,
  maybe_include?: string[] | null,
): string[];
/**
 * Get all available rule codes.
 */
export function getAllRules(): string[];
/**
 * Get the rule codes associated with the recommended tag.
 */
export function getRecommendedRules(): string[];
/**
 * Get all of the tags associated with the given rule codes. If no rules
 * are provided, all available tags will be returned.
 */
export function getTags(maybe_rules?: string[] | null): string[];
/**
 * Get all available tags.
 */
export function getAllTags(): string[];

/**
 * Represents a position in a source code string.
 * @category Types
 * @tags index, position
 */
export interface Position {
  /** The 0-based line index of the position. */
  line: number;
  /** The 0-based column index of the position. */
  col: number;
  /** The 0-based byte offset of the position. */
  bytePos: number;
}

/**
 * Represents a position in a source code string for display purposes.
 * @category Types
 * @tags display, position
 */
export interface DisplayPosition {
  /** The 1-based display line number of the position. */
  line: number;
  /** The 1-based display column number of the position. */
  col: number;
  /** The 1-based display byte offset of the position. */
  byte: number;
}

/**
 * Represents a range of text in a source code string.
 * @category Types
 * @tags range
 */
export interface Range {
  /** The starting position of the range. */
  start: Position;
  /** The ending position of the range. */
  end: Position;
}

/**
 * Represents a single change to a source code string.
 * @category Types
 * @tags fix
 */
export interface LintFixChange {
  /** The new text to replace the old text with. */
  newText: string;
  /** The range of the text to replace. */
  range: Range;
}

/**
 * Represents a fix to apply to a source code string.
 * @category Types
 * @tags fix
 */
export interface LintFix {
  /** A description of the fix. */
  description: string;
  /** An array of changes to apply. */
  changes: LintFixChange[];
}

/**
 * Applies a single {@linkcode LintFixChange} to the provided source code,
 * returning the transformed source code as a new string.
 *
 * If the change is out of range or fails to apply, an error is thrown.
 *
 * @param {string} source The source code to transform.
 * @param {LintFixChange} change The change to apply.
 * @returns {string} The transformed source code.
 * @throws {RangeError} If the change is out of range.
 * @throws {Error} If the change fails to apply.
 * @category Fixes
 * @tags fix
 * @example Applying a change to a source code string:
 * ```ts
 * import * as dlint from "@nick/deno-lint";
 *
 * const source = "window.alert(`Hello, world! Running on ${process.arch}`);\n";
 *
 * // window is no longer available in Deno 2.0
 * const { fixes } = dlint.lint(source, "example.ts", ["recommended"]);
 * const [fix] = fixes;
 * const [change] = fix.changes;
 * const fixed = dlint.applyFixChange(source, change);
 *
 * // updates window to globalThis, but does not fix the no-node-globals rule:
 * console.log(fixed);
 * // 'globalThis.alert(`Hello, world! Running on ${process.arch}`);\n'
 * ```
 */
export function applyFixChange(source: string, change: LintFixChange): string;

/**
 * Applies the first change from a single {@linkcode LintFix} to the provided
 * source code string, returning the transformed source code as a new string.
 *
 * If the change is out of range or fails to apply, an error is thrown.
 *
 * @param {string} source The source code to transform.
 * @param {LintFix} change The fix to apply the change from.
 * @returns {string} The transformed source code.
 * @throws {RangeError} If the fix change is out of range.
 * @throws {Error} If the change fails to apply.
 * @category Fixes
 * @tags fix
 * @example Applying a single fix to a source code string:
 * ```ts
 * import * as dlint from "@nick/deno-lint";
 *
 * const source = "window.alert(`Hello, world! Running on ${process.arch}`);\n";
 *
 * // window is no longer available in Deno 2.0
 * const { fixes } = dlint.lint(source, "example.ts", ["recommended"]);
 * const [fix] = fixes;
 * const [change] = fix.changes;
 * const fixed = dlint.applyFix(source, change);
 *
 * // updates window to globalThis, but does not fix the no-node-globals rule:
 * console.log(fixed);
 * // 'globalThis.alert(`Hello, world! Running on ${process.arch}`);\n'
 * ```
 */
export function applyFix(source: string, fix: LintFix): string;


/**
 * Applies the first change from each of the provided fixes to a source code
 * string. Fixes are sorted by the start position of their first change, and
 * applied in reverse order to prevent changes from overlapping and causing
 * erroneous output.
 *
 * Returns the transformed source code as a string. If any of the fixes fail
 * to apply, or if any of their ranges overlap, an error will be thrown.
 *
 * @param {string} source The source code to transform.
 * @param {LintFix[]} fixes An array of fixes to apply.
 * @returns {string} The transformed source code.
 * @category Fixes
 * @tags fix
 * @example Applying multiple fixes to a source code string:
 * ```ts
 * import * as dlint from "@nick/deno-lint";
 *
 * const source = "window.alert(`Hello, world! Running on ${process.arch}`);\n";
 *
 * // window is no longer available in Deno 2.0
 * // process is available (ish), but should be imported from "node:process"
 * const { fixes } = dlint.lint(source, "example.ts", ["recommended"]);
 *
 * const fixed = dlint.applyFixes(source, fixes);
 *
 * // inserts an import statement and updates window to globalThis:
 * console.log(fixed);
 * // 'import process from "node:process";\n' +
 * //   "globalThis.alert(`Hello, world! Running on ${process.arch}`);\n"
 * ```
 */
export function applyFixes(source: string, fixes: LintFix[]): string;

/**
 * Applies all of the changes from a given fix to a source code string.
 *
 * Changes are sorted by their starting byte position, and applied in reverse
 * order to avoid potentially overlapping ranges.
 *
 * @param {string} source The source code to transform.
 * @param {LintFix} fix The fix to apply the changes from.
 * @returns {string} The transformed source code.
 * @category Fixes
 * @tags fix, fixes, multiple
 * @example Applying all changes from a fix to a source code string:
 * ```ts
 * import * as dlint from "@nick/deno-lint";
 *
 * // window is no longer available in Deno 2.0
 * const source = `window.alert("Hello, world!");\n`;
 *
 * const { fixes } = dlint.lint(source, "example.ts", ["recommended"]);
 * const [fix] = fixes;
 * const fixed = dlint.applyAllChangesFromFix(source, fix);
 *
 * console.log(fixed);
 * // 'globalThis.alert("Hello, world!");\n'
 * ```
 */
export function applyAllChanges(source: string, fix: LintFix): string;

/**
 * Applies all of the changes from all of the provided fixes to a source code
 * string. Fixes are sorted by the start positions of their changes, and are
 * applied in reverse order to prevent subsequent fixes from overlapping.
 *
 * Each fix has its changes applied in the order they are provided. If any
 * of the fixes fail to apply, or if any of their ranges overlap, an error will
 * be thrown. Otherwise, the transformed string is returned.
 *
 * @param {string} source The source code to transform.
 * @param {LintFix[]} fixes An array of fixes to apply.
 * @returns {string} The transformed source code.
 * @category Fixes
 * @tags fix, fixes, multiple
 */
export function applyAllFixes(source: string, fixes: LintFix[]): string;

/**
 * Compare two `LintFixChange` objects by their range, in descending order.
 *
 * @param {LintFixChange} a The first `LintFixChange` object to compare.
 * @param {LintFixChange} b The second `LintFixChange` object to compare.
 * @returns {number} A negative value if `a` should be before `b`, a positive
 *  value if `a` should be after `b`, or zero if `a` and `b` are equal.
 * @category Fixes
 * @tags compare, changes, descending
 */
export function compareChanges(a: LintFixChange, b: LintFixChange): -1 | 0 | 1;

/**
 * Compare two `LintFixChange` objects by their range, in ascending order.
 *
 * @param {LintFixChange} a The first `LintFixChange` object to compare.
 * @param {LintFixChange} b The second `LintFixChange` object to compare.
 * @returns {number} A negative value if `a` should be before `b`, a positive
 *  value if `a` should be after `b`, or zero if `a` and `b` are equal.
 * @category Fixes
 * @tags compare, changes, ascending
 */
export function compareChangesAsc(
  a: LintFixChange,
  b: LintFixChange,
): -1 | 0 | 1;

/**
 * Compare two `LintFix` objects by their changes, in descending order.
 *
 * @param {LintFix} a The first `LintFix` object to compare.
 * @param {LintFix} b The second `LintFix` object to compare.
 * @returns {number} A negative value if `a` should be before `b`, a positive
 *  value if `a` should be after `b`, or zero if `a` and `b` are equal.
 * @category Fixes
 * @tags compare, descending
 */
export function compareFixes(a: LintFix, b: LintFix): -1 | 0 | 1;

/**
 * Compare two `LintFix` objects by their changes, in ascending order.
 *
 * @param {LintFix} a The first `LintFix` object to compare.
 * @param {LintFix} b The second `LintFix` object to compare.
 * @returns {number} A negative value if `a` should be before `b`, a positive
 *  value if `a` should be after `b`, or zero if `a` and `b` are equal.
 * @category Fixes
 * @tags compare, ascending
 */
export function compareFixesAsc(a: LintFix, b: LintFix): -1 | 0 | 1;

/**
 * Sort an array of `LintFix` objects based on the starting byte position of the
 * first change in each fix. If multiple fixes have the same starting byte
 * position, the fix with the smallest ending byte position will be placed first.
 * This function is used to sort fixes in reverse order, to avoid overlapping changes.
 *
 * @param {LintFix[]} fixes An array of `LintFix` objects to sort.
 * @returns {LintFix[]} A new array of `LintFix` objects, sorted by the starting byte
 *  position of the first change in each fix.
 * @category Fixes
 * @tags sort, descending
 */
export function sortFixes(fixes: LintFix[]): LintFix[];

/**
 * Sort an array of `LintFix` objects based on the starting byte position of the
 * first change in each fix, in ascending order. This function is used to sort fixes
 * in the order they appear in the source file. If you are sorting fixes in preparation
 * for applying them to a source file, you should use the `sortFixes` function instead,
 * which sorts in descending order to avoid overlapping changes.
 *
 * @param {LintFix[]} fixes An array of `LintFix` objects to sort.
 * @returns {LintFix[]} A new array of `LintFix` objects, sorted by the starting byte
 *  position of the first change in each fix, in ascending order.
 * @category Fixes
 * @tags sort, ascending
 */
export function sortFixesAsc(fixes: LintFix[]): LintFix[];

/**
 * Sort an array of `LintFix` objects based on the overall range of changes in each
 * fix, in descending order. This function is used to sort fixes with two or more
 * changes by computing and comparing an overall range from the ranges of all the
 * changes in each fix. If multiple fixes have the same overall range, the fix with
 * the smallest ending byte position will be placed last.
 *
 * @param {LintFix[]} fixes An array of `LintFix` objects to sort.
 * @returns {LintFix[]} A new array of `LintFix` objects, sorted by the overall range
 *  of changes in each fix.
 * @category Fixes
 * @tags sort, descending, overall
 */
export function sortFixesOverall(fixes: LintFix[]): LintFix[];

/**
 * Sort an array of `LintFix` objects based on the overall range of changes in each
 * fix, in ascending order. This function is used to sort fixes with two or more
 * changes by computing and comparing an overall range from the ranges of all the
 * changes in each fix. If multiple fixes have the same overall range, the fix with
 * the smallest ending byte position will be placed first.
 *
 * @param {LintFix[]} fixes An array of `LintFix` objects to sort.
 * @returns {LintFix[]} A new array of `LintFix` objects, sorted by the overall range
 *  of changes in each fix, in ascending order.
 * @category Fixes
 * @tags sort, ascending, overall
 */
export function sortFixesOverallAsc(fixes: LintFix[]): LintFix[];

export class Fs {
  free(): void;
  constructor();
  static cwd(): string;
  static chdir(path: string): void;
  static statSync(path: string): any;
  static readFileSync(path: string): any;
  static readTextFileSync(path: string): string;
  static readdirSync(path: string, recursive: boolean): any;
  static writeFileSync(path: string, data: any): void;
  static writeTextFileSync(path: string, data: string): void;
}
