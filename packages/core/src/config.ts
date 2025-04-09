import type { RuleLike, TagLike } from "./rules.generated.ts";

/**
 * Configuration options for the linter's file-matching behavior when running
 * in a context that has I/O access to a filesystem (virtual or physical).
 *
 * ### Recursive
 *
 * The `recursive` option allows you to specify whether the linter should
 * recursively lint all files in the specified folder and its subfolders.
 *
 * ### File Extensions
 *
 * The `extensions` option allows you to specify which file extensions should
 * be included when the linter is run on a folder.
 *
 * This makes it easy to pick files to lint without resorting to potentially
 * complex patterns. Extensions can be provided with/without leading dots, and
 * are case-insensitive. The linter's default extensions are as follows:
 *
 * ```json
 * [".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs", ".cts", ".mts"]
 * ```
 *
 * When combined with glob patterns, these act as an additional filter on top
 * of the patterns provided in the `include` and `exclude` options. Only the
 * files that **also** match the configured extensions will be included in the
 * group of target source files.
 *
 * ### File Inclusion and Exclusion
 *
 * Patterns in the `exclude` option will always take precedence over those in
 * the `include` option. This follows the same conventions as other utilities
 * that use globbing and glob-like behaviors, such as Git and ESLint.
 *
 * This allows you to easily target a very specific subset of files, by first
 * including a broad range of files/folders (with a pattern like `*.{js,ts}`),
 * and then narrowing that down by excluding specific patterns which you do not
 * want to lint (e.g. `*.test.*`).
 *
 * For example, to lint all `.ts` files in the `./src` directory, but **not**
 * files that end in `.test.ts` or `.spec.ts`, see the example config below.
 *
 * **Note**: the backslashes below are only to avoid breaking JSDoc comments.
 *
 * @example
 * ```json
 * {
 *  "include": ["./src/**\/*.ts"],
 *  "exclude": ["./src/**\/*.test.ts", "./src/**\/*.spec.ts"]
 * }
 * ```
 * @remarks
 * This is only used when the linter is run in a context with I/O access (e.g.
 * in a Node-like environment such as Node, Deno, or Bun). Support can also be
 * extended to other environments (e.g. browsers) if a virtual file system
 * abstraction is used that is compatible with the API expected by the linter.
 * @category Configuration
 */
export interface FilesConfig {
  /**
   * Glob patterns of files to be included in the linting process.
   */
  include?: string[] | null | undefined;
  /**
   * Glob patterns of files to be excluded from the linting process, which take
   * a higher precedence than those in the `include` option.
   */
  exclude?: string[] | null | undefined;
  /**
   * File extensions to be included in the linting process.
   *
   * **Note**: This is only relevant when the linter is run in a context with
   * I/O access to a filesystem (virtual or physical). Otherwise it is ignored.
   *
   * @default {[".ts",".tsx",".js",".jsx",".cjs",".mjs",".cts",".mts"]}
   */
  extensions?: string[] | null | undefined;
  /**
   * Whether to recursively lint all files in the specified folder and its
   * subfolders. Defaults to `false`.
   *
   * @default {false}
   */
  recursive?: boolean | null | undefined;
}

/**
 * Configuration options for rules to be applied.
 */
export interface RulesConfig {
  /**
   * Array of rule tags to be included in the linting process.
   *
   * - If `tags` is not provided, all rules will be included.
   * - If an empty array is provided, no rules will be included.
   *
   * @default {["recommended"]}
   */
  tags?: TagLike[] | null | undefined;
  /**
   * Specific {@linkcode Rule} names to be included in the linting process.
   */
  exclude?: RuleLike[] | null | undefined;
  include?: RuleLike[] | null | undefined;
}

/**
 * Configuration options passed directly to the internal `deno_lint` crate
 * which this library runs under the hood (in the form of a custom WebAssembly
 * build that is compiled from Rust).
 *
 * These options allow you to control the internal behavior of the linter, such
 * as the default JSX factory function, custom ignore directives, the default
 * file specifier, and more.
 *
 * Overriding the ignoring file / ignore diagnostic directives can be useful if
 * you want to lint a codebase that follows a different convention than the
 * default `deno-lint-ignore` and `deno-lint-ignore-file` directives.
 *
 * See the example below for a demonstration of configuring the linter for code
 * that uses ESLint ignore directives.
 *
 * @example
 * ```ts
 * import {
 *   Linter,
 *   type LinterConfig,
 *   type Config,
 * } from "@nick/lint";
 *
 * const linterConfig = {
 *   ignoreFileDirective: "eslint-disable",
 *   ignoreDiagnosticDirective: "eslint-disable-next-line",
 * } satisfies LinterConfig;
 *
 * const config = {
 *   linter: linterConfig,
 *   rules: {
 *     tags: ["recommended"],
 *   },
 * } satisfies Config;
 *
 * const linter = new Linter(config);
 *
 * const results = linter.lint(`
 *  // eslint-disable-next-line no-unused-vars
 *  const foo = 1;
 *
 *  // eslint-disable no-unused-vars
 *  const bar = 2;
 *
 *  // purposely not ignored
 *  const baz = 3;
 * `);
 *
 * // purdy-print the results!
 * results.forEach((res) => res.print());
 * ```
 *
 * @category Configuration
 */
export interface LinterConfig {
  /**
   * Optional file specifier for the source code being linted. This is used
   * to determine the file name and extension, the latter of which has a
   * direct impact on the behavior of certain rules (e.g. JSX rules).
   *
   * @default {"untitled.ts"}
   */
  specifier?: string | URL;
  /**
   * Optional custom ignore file directive.
   *
   * @default {"deno-lint-ignore-file"}
   */
  ignoreFileDirective?: string;
  /**
   * Optional custom ignore diagnostic directive.
   *
   * @default {"deno-lint-ignore"}
   */
  ignoreDiagnosticDirective?: string;
  /**
   * Optional default JSX factory function. Only used when linting files with
   * either a `.jsx` or `.tsx` extension.
   *
   * @default {"React.createElement"}
   */
  jsxFactory?: string;
  /**
   * Optional default JSX fragment factory function. Only used when linting
   * files with either a `.jsx` or `.tsx` extension.
   *
   * @default {"React.Fragment"}
   */
  jsxFragmentFactory?: string;
}

/**
 * Configuration options for the main {@linkcode Linter} class, allowing you to
 * control its file-matching and rule-matching behavior, as well as how the
 * actual linting is performed.
 *
 * @category Configuration
 */
export interface Config {
  /**
   * Configuration for the files to be linted.
   */
  files?: FilesConfig;
  /**
   * Configuration for the rules to be applied.
   */
  rules?: RulesConfig;
  /**
   * Optional configuration for the linter.
   */
  linter?: LinterConfig;
}
