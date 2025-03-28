import { Path, type PathLike } from "@nick/fsxx/path";

import { wasm } from "./wasm.ts";
import { type Diagnostic, LintDiagnostic } from "./diagnostic.ts";
import type { Config, InputType } from "./types.ts";
import { Tag } from "./rules.generated.ts";
import { LintFix } from "./fix.ts";

export type LintResult = readonly LintDiagnostic[];

export interface LintFileResult {
  specifier: string;
  mediaType?: string;
  sourceText: string;
  diagnostics: LintDiagnostic[];
  errors: Diagnostic[];
  fixes: LintFix[];
}

export interface LintFilesResults {
  inputs: string[];
  checked: string[];
  config: Config;
  results: Map<string, LintFileResult>;
}

interface WasmLintFileResponse {
  specifier: string;
  type: string;
  text: string;
  config?: Record<string, unknown>;
  diagnostics: Diagnostic[];
  errors: Diagnostic[];
  fixes: LintFix[];
}

type WasmLintFilesResponse = WasmLintFileResponse[];

/**
 * The `Linter` class provides methods for linting source code and files using
 * the `deno lint` engine, collecting and returning any problems found as
 * {@linkcode LintDiagnostic} objects.
 *
 * ### Diagnostics
 *
 * Depending on the type of diagnostic, the linter may also return a list of
 * suggestions for fixing the problem, which can be applied to the source code
 * using the `applyFix` method on the diagnostic.
 *
 * ### Configuration
 *
 * Configuration options for the linter can be set using the {@linkcode config}
 * property, or passed as an argument to the constructor. Temporary overrides
 * can be passed on a per-call basis to the linting methods, by passing in a
 * partial configuration object in the appropriate (optional) parameter.
 *
 * @example
 * ```ts
 * import { Linter } from "@nick/lint";
 *
 * const linter = new Linter({
 *   rules: {
 *     tags: ["recommended"],
 *     exclude: ["no-explicit-any"],
 *   },
 * });
 *
 * // linting a string of source code
 * const results = linter.lint(`
 *   // deno-lint-ignore no-unused-vars
 *   var bar = 2;
 *
 *   namespace foo {
 *     export function im_tellin_you_cleetus_that_boy_aint_right() {}
 *   }
 * `);
 *
 * for (const res of results) res.print();
 * ```
 * @category Core
 */
export class Linter {
  // #region static

  /**
   * The default configuration options used by the default singleton `Linter`
   * instance, and as a base config for all new `Linter` instances as well.eeeeeee
   *
   * These options can be overridden on a per-instance level by passing a
   * partial configuration object to the constructor. Instance-level options
   * can be further overridden for the duration of a single linting operation
   * by passing a configuration object to the linting method being called.
   *
   * @readonly
   * @static
   */
  static readonly defaultConfig = {
    files: {
      exclude: ["**/{node_modules,vendor,dist,build,out}/**", "*.min.*"],
      include: ["**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}"],
    },
    rules: {
      tags: [Tag.Default],
      exclude: [],
      include: [],
    },
    linter: {
      specifier: "untitled.ts",
      ignoreFileDirective: "deno-lint-ignore-file",
      ignoreDiagnosticDirective: "deno-lint-ignore",
      jsxFactory: "React.createElement",
      jsxFragmentFactory: "React.Fragment",
    },
  } as const satisfies Config;

  /**
   * Default `Linter` instance with default configuration, available as a
   * global static singleton for convenience and easy access.
   *
   * @readonly
   * @static
   */
  static readonly default: Linter = new Linter();

  // #endregion static

  /**
   * Creates a new `Linter` instance with the given configuration.
   *
   * @param [config] Optional configuration object.
   * @returns A new `Linter` instance.
   */
  constructor(config?: Config) {
    if (config) this.config = config;
  }

  // #region private

  #config: Config = Linter.defaultConfig;

  #createLintFileResult(
    response: WasmLintFileResponse,
    config?: Config,
  ): LintFileResult {
    config ??= this.config;
    const { specifier, type: mediaType, text: sourceText } = response;
    const diagnostics = response.diagnostics.map(LintDiagnostic.from);
    const errors = response.errors.map(LintDiagnostic.from);
    const fixes = response.fixes.map(LintFix.from);

    return {
      __proto__: null,
      specifier,
      mediaType,
      sourceText,
      diagnostics,
      errors,
      fixes,
    } as unknown as LintFileResult;
  }

  #createLintFilesResults(
    response: WasmLintFilesResponse,
    config?: Config,
  ): LintFilesResults {
    config ??= this.config;
    const results = new Map<string, LintFileResult>();
    const inputs = new Set<string>();
    const checked = new Set<string>();

    for (const res of response) {
      const { specifier } = res;
      const result = this.#createLintFileResult(res, config);
      inputs.add(specifier);
      checked.add(specifier);
      results.set(specifier, result);
    }

    return {
      __proto__: null,
      inputs: [...inputs],
      checked: [...checked],
      config,
      results,
    } as unknown as LintFilesResults;
  }

  // #endregion private

  // #region public

  /**
   * Configuration options for this `Linter` instance.
   */
  get config(): Config {
    return this.#config;
  }

  set config(config: Config) {
    this.#config = {
      ...this.#config,
      ...config,
      linter: { ...this.#config.linter, ...config?.linter },
    };
  }

  // #region lint methods

  /**
   * Lints the given source code and returns an array of diagnostics.
   */
  lint(source: InputType, configOverrides?: Config): LintResult {
    const config = { ...this.config, ...configOverrides };
    const {
      rules: { tags, exclude, include } = {},
      linter: {
        specifier = Linter.defaultConfig.linter.specifier,
        ignoreFileDirective,
        ignoreDiagnosticDirective,
        jsxFactory,
        jsxFragmentFactory,
      } = {},
    } = config;

    if (typeof source !== "string") source = new TextDecoder().decode(source);

    const filename = new URL(specifier, "file://").toString();
    const response = wasm.lint(
      source,
      filename,
      tags,
      exclude,
      include,
      ignoreFileDirective,
      ignoreDiagnosticDirective,
      jsxFactory,
      jsxFragmentFactory,
    );

    return response.diagnostics.map(LintDiagnostic.from);
  }

  /**
   * Lints the given source file and returns an array of diagnostics.
   */
  lintFile(
    specifier: PathLike,
    configOverrides?: Config,
  ): LintFileResult {
    const config = { ...this.config, ...configOverrides };
    const {
      // files: { exclude: excludeFiles, include: includeFiles } = {},
      rules: { tags, exclude, include } = {},
      linter: {
        ignoreFileDirective,
        ignoreDiagnosticDirective,
        jsxFactory,
        jsxFragmentFactory,
      } = {},
    } = config;

    specifier = Path.from(specifier).resolve().toString();
    const response = wasm.lintFile(
      specifier,
      tags,
      exclude,
      include,
      ignoreFileDirective,
      ignoreDiagnosticDirective,
      jsxFactory,
      jsxFragmentFactory,
    );

    const {
      specifier: _linterResolvedSpecifier,
      text: sourceText,
      errors,
      fixes,
    } = response;
    const diagnostics = response.diagnostics.map(LintDiagnostic.from);
    const mediaType = response.type;
    return {
      __proto__: null,
      specifier,
      mediaType,
      sourceText,
      diagnostics,
      errors,
      fixes,
    } as unknown as LintFileResult;
  }

  /**
   * Lints the given source files and returns an object mapping file names to
   * arrays of diagnostics.
   */
  lintFiles(
    specifiers: (string | URL)[],
    configOverrides?: Config,
  ): LintFilesResults {
    const config = { ...this.config, ...configOverrides };
    const {
      // files: { exclude: excludeFiles, include: includeFiles } = {},
      rules: { tags, exclude, include } = {},
      linter: {
        ignoreFileDirective,
        ignoreDiagnosticDirective,
        jsxFactory,
        jsxFragmentFactory,
      } = {},
    } = config;

    const response = wasm.lintFiles(
      specifiers.map((s) => s.toString()),
      tags,
      exclude,
      include,
      ignoreFileDirective,
      ignoreDiagnosticDirective,
      jsxFactory,
      jsxFragmentFactory,
    ) as WasmLintFilesResponse;

    return this.#createLintFilesResults(response, config);
  }

  /**
   * Walks the given folder and lints all files matching the configured glob
   * patterns and/or file extensions, returning a {@linkcode LintFilesResults}
   * object containing the results.
   *
   * @param [folder] The path to the folder to lint, as a relative or absolute
   * path in the form of a primitive string, URL object,
   */
  lintFolder(
    folder: PathLike,
    configOverrides?: Config,
  ): LintFilesResults {
    const config = {
      ...this.config,
      ...configOverrides,
      files: { ...this.config.files, ...configOverrides?.files },
    };
    const {
      files: {
        // exclude: excludeFiles,
        // include: includeFiles,
        extensions,
        recursive = false,
      } = {},
      rules: { tags, exclude, include } = {},
      linter: {
        ignoreFileDirective,
        ignoreDiagnosticDirective,
        jsxFactory,
        jsxFragmentFactory,
      } = {},
    } = config;

    const response = wasm.lintFolder(
      folder.toString(),
      !!recursive,
      extensions,
      tags,
      exclude,
      include,
      ignoreFileDirective,
      ignoreDiagnosticDirective,
      jsxFactory,
      jsxFragmentFactory,
    ) as WasmLintFilesResponse;

    return this.#createLintFilesResults(response, config);
  }

  // #endregion lint methods

  // #endregion public
}
