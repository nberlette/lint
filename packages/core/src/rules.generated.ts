// This file is auto-generated. Do not edit manually.

import type { EnumKey, strings } from "./_internal.ts";
import { wasm } from "./wasm.ts";

/**
 * This module provides generated {@linkcode Rule} and {@linkcode Tag} enums.
 *
 * These represent all the available linting rules and tags, respectively,
 * supported by the version of the `deno_lint` crate that was compiled to
 * WebAssembly in this version of the `@nick/lint` package.
 *
 * This file is re-generated on every build to ensure the TypeScript side of
 * the codebase is always kept in sync with the Rust side.
 *
 * @module rules
 */

/**
 * The `Rule` enum represents the unique identifier codes for all of
 * the available linting rules in this version of the `deno lint` utility.
 * @category Core
 * @tags rules, enum
 */
export enum Rule {
  /**
   * Represents the `adjacent-overload-signatures` linting rule.
   * @see https://docs.deno.com/lint/rules/adjacent-overload-signatures
   * @tags recommended
   */
  AdjacentOverloadSignatures = "adjacent-overload-signatures",
  /**
   * Represents the `ban-ts-comment` linting rule.
   * @see https://docs.deno.com/lint/rules/ban-ts-comment
   * @tags recommended
   */
  BanTsComment = "ban-ts-comment",
  /**
   * Represents the `ban-types` linting rule.
   * @see https://docs.deno.com/lint/rules/ban-types
   * @tags recommended
   */
  BanTypes = "ban-types",
  /**
   * Represents the `ban-unknown-rule-code` linting rule.
   * @see https://docs.deno.com/lint/rules/ban-unknown-rule-code
   * @tags recommended
   */
  BanUnknownRuleCode = "ban-unknown-rule-code",
  /**
   * Represents the `ban-untagged-ignore` linting rule.
   * @see https://docs.deno.com/lint/rules/ban-untagged-ignore
   * @tags recommended
   */
  BanUntaggedIgnore = "ban-untagged-ignore",
  /**
   * Represents the `ban-untagged-todo` linting rule.
   * @see https://docs.deno.com/lint/rules/ban-untagged-todo
   */
  BanUntaggedTodo = "ban-untagged-todo",
  /**
   * Represents the `ban-unused-ignore` linting rule.
   * @see https://docs.deno.com/lint/rules/ban-unused-ignore
   * @tags recommended
   */
  BanUnusedIgnore = "ban-unused-ignore",
  /**
   * Represents the `camelcase` linting rule.
   * @see https://docs.deno.com/lint/rules/camelcase
   */
  Camelcase = "camelcase",
  /**
   * Represents the `constructor-super` linting rule.
   * @see https://docs.deno.com/lint/rules/constructor-super
   * @tags recommended
   */
  ConstructorSuper = "constructor-super",
  /**
   * Represents the `default-param-last` linting rule.
   * @see https://docs.deno.com/lint/rules/default-param-last
   */
  DefaultParamLast = "default-param-last",
  /**
   * Represents the `eqeqeq` linting rule.
   * @see https://docs.deno.com/lint/rules/eqeqeq
   */
  Eqeqeq = "eqeqeq",
  /**
   * Represents the `explicit-function-return-type` linting rule.
   * @see https://docs.deno.com/lint/rules/explicit-function-return-type
   */
  ExplicitFunctionReturnType = "explicit-function-return-type",
  /**
   * Represents the `explicit-module-boundary-types` linting rule.
   * @see https://docs.deno.com/lint/rules/explicit-module-boundary-types
   */
  ExplicitModuleBoundaryTypes = "explicit-module-boundary-types",
  /**
   * Represents the `for-direction` linting rule.
   * @see https://docs.deno.com/lint/rules/for-direction
   * @tags recommended
   */
  ForDirection = "for-direction",
  /**
   * Represents the `fresh-handler-export` linting rule.
   * @see https://docs.deno.com/lint/rules/fresh-handler-export
   * @tags fresh
   */
  FreshHandlerExport = "fresh-handler-export",
  /**
   * Represents the `fresh-server-event-handlers` linting rule.
   * @see https://docs.deno.com/lint/rules/fresh-server-event-handlers
   * @tags fresh
   */
  FreshServerEventHandlers = "fresh-server-event-handlers",
  /**
   * Represents the `getter-return` linting rule.
   * @see https://docs.deno.com/lint/rules/getter-return
   * @tags recommended
   */
  GetterReturn = "getter-return",
  /**
   * Represents the `guard-for-in` linting rule.
   * @see https://docs.deno.com/lint/rules/guard-for-in
   */
  GuardForIn = "guard-for-in",
  /**
   * Represents the `jsx-boolean-value` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-boolean-value
   * @tags jsx,react,recommended
   */
  JsxBooleanValue = "jsx-boolean-value",
  /**
   * Represents the `jsx-button-has-type` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-button-has-type
   * @tags fresh,jsx,react,recommended
   */
  JsxButtonHasType = "jsx-button-has-type",
  /**
   * Represents the `jsx-curly-braces` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-curly-braces
   * @tags jsx,react,recommended
   */
  JsxCurlyBraces = "jsx-curly-braces",
  /**
   * Represents the `jsx-key` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-key
   * @tags jsx,react,recommended
   */
  JsxKey = "jsx-key",
  /**
   * Represents the `jsx-no-children-prop` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-no-children-prop
   * @tags fresh,jsx,react,recommended
   */
  JsxNoChildrenProp = "jsx-no-children-prop",
  /**
   * Represents the `jsx-no-comment-text-nodes` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-no-comment-text-nodes
   * @tags fresh,jsx,react,recommended
   */
  JsxNoCommentTextNodes = "jsx-no-comment-text-nodes",
  /**
   * Represents the `jsx-no-duplicate-props` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-no-duplicate-props
   * @tags jsx,react,recommended
   */
  JsxNoDuplicateProps = "jsx-no-duplicate-props",
  /**
   * Represents the `jsx-no-unescaped-entities` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-no-unescaped-entities
   * @tags fresh,jsx,react,recommended
   */
  JsxNoUnescapedEntities = "jsx-no-unescaped-entities",
  /**
   * Represents the `jsx-no-useless-fragment` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-no-useless-fragment
   * @tags fresh,jsx,react,recommended
   */
  JsxNoUselessFragment = "jsx-no-useless-fragment",
  /**
   * Represents the `jsx-props-no-spread-multi` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-props-no-spread-multi
   * @tags jsx,react,recommended
   */
  JsxPropsNoSpreadMulti = "jsx-props-no-spread-multi",
  /**
   * Represents the `jsx-void-dom-elements-no-children` linting rule.
   * @see https://docs.deno.com/lint/rules/jsx-void-dom-elements-no-children
   * @tags fresh,jsx,react,recommended
   */
  JsxVoidDomElementsNoChildren = "jsx-void-dom-elements-no-children",
  /**
   * Represents the `no-array-constructor` linting rule.
   * @see https://docs.deno.com/lint/rules/no-array-constructor
   * @tags recommended
   */
  NoArrayConstructor = "no-array-constructor",
  /**
   * Represents the `no-async-promise-executor` linting rule.
   * @see https://docs.deno.com/lint/rules/no-async-promise-executor
   * @tags recommended
   */
  NoAsyncPromiseExecutor = "no-async-promise-executor",
  /**
   * Represents the `no-await-in-loop` linting rule.
   * @see https://docs.deno.com/lint/rules/no-await-in-loop
   */
  NoAwaitInLoop = "no-await-in-loop",
  /**
   * Represents the `no-await-in-sync-fn` linting rule.
   * @see https://docs.deno.com/lint/rules/no-await-in-sync-fn
   * @tags recommended
   */
  NoAwaitInSyncFn = "no-await-in-sync-fn",
  /**
   * Represents the `no-boolean-literal-for-arguments` linting rule.
   * @see https://docs.deno.com/lint/rules/no-boolean-literal-for-arguments
   */
  NoBooleanLiteralForArguments = "no-boolean-literal-for-arguments",
  /**
   * Represents the `no-case-declarations` linting rule.
   * @see https://docs.deno.com/lint/rules/no-case-declarations
   * @tags recommended
   */
  NoCaseDeclarations = "no-case-declarations",
  /**
   * Represents the `no-class-assign` linting rule.
   * @see https://docs.deno.com/lint/rules/no-class-assign
   * @tags recommended
   */
  NoClassAssign = "no-class-assign",
  /**
   * Represents the `no-compare-neg-zero` linting rule.
   * @see https://docs.deno.com/lint/rules/no-compare-neg-zero
   * @tags recommended
   */
  NoCompareNegZero = "no-compare-neg-zero",
  /**
   * Represents the `no-cond-assign` linting rule.
   * @see https://docs.deno.com/lint/rules/no-cond-assign
   * @tags recommended
   */
  NoCondAssign = "no-cond-assign",
  /**
   * Represents the `no-console` linting rule.
   * @see https://docs.deno.com/lint/rules/no-console
   */
  NoConsole = "no-console",
  /**
   * Represents the `no-const-assign` linting rule.
   * @see https://docs.deno.com/lint/rules/no-const-assign
   */
  NoConstAssign = "no-const-assign",
  /**
   * Represents the `no-constant-condition` linting rule.
   * @see https://docs.deno.com/lint/rules/no-constant-condition
   * @tags recommended
   */
  NoConstantCondition = "no-constant-condition",
  /**
   * Represents the `no-control-regex` linting rule.
   * @see https://docs.deno.com/lint/rules/no-control-regex
   * @tags recommended
   */
  NoControlRegex = "no-control-regex",
  /**
   * Represents the `no-debugger` linting rule.
   * @see https://docs.deno.com/lint/rules/no-debugger
   * @tags recommended
   */
  NoDebugger = "no-debugger",
  /**
   * Represents the `no-delete-var` linting rule.
   * @see https://docs.deno.com/lint/rules/no-delete-var
   * @tags recommended
   */
  NoDeleteVar = "no-delete-var",
  /**
   * Represents the `no-deprecated-deno-api` linting rule.
   * @see https://docs.deno.com/lint/rules/no-deprecated-deno-api
   * @tags recommended
   */
  NoDeprecatedDenoApi = "no-deprecated-deno-api",
  /**
   * Represents the `no-dupe-args` linting rule.
   * @see https://docs.deno.com/lint/rules/no-dupe-args
   * @tags recommended
   */
  NoDupeArgs = "no-dupe-args",
  /**
   * Represents the `no-dupe-class-members` linting rule.
   * @see https://docs.deno.com/lint/rules/no-dupe-class-members
   * @tags recommended
   */
  NoDupeClassMembers = "no-dupe-class-members",
  /**
   * Represents the `no-dupe-else-if` linting rule.
   * @see https://docs.deno.com/lint/rules/no-dupe-else-if
   * @tags recommended
   */
  NoDupeElseIf = "no-dupe-else-if",
  /**
   * Represents the `no-dupe-keys` linting rule.
   * @see https://docs.deno.com/lint/rules/no-dupe-keys
   * @tags recommended
   */
  NoDupeKeys = "no-dupe-keys",
  /**
   * Represents the `no-duplicate-case` linting rule.
   * @see https://docs.deno.com/lint/rules/no-duplicate-case
   * @tags recommended
   */
  NoDuplicateCase = "no-duplicate-case",
  /**
   * Represents the `no-empty` linting rule.
   * @see https://docs.deno.com/lint/rules/no-empty
   * @tags recommended
   */
  NoEmpty = "no-empty",
  /**
   * Represents the `no-empty-character-class` linting rule.
   * @see https://docs.deno.com/lint/rules/no-empty-character-class
   * @tags recommended
   */
  NoEmptyCharacterClass = "no-empty-character-class",
  /**
   * Represents the `no-empty-enum` linting rule.
   * @see https://docs.deno.com/lint/rules/no-empty-enum
   * @tags recommended
   */
  NoEmptyEnum = "no-empty-enum",
  /**
   * Represents the `no-empty-interface` linting rule.
   * @see https://docs.deno.com/lint/rules/no-empty-interface
   * @tags recommended
   */
  NoEmptyInterface = "no-empty-interface",
  /**
   * Represents the `no-empty-pattern` linting rule.
   * @see https://docs.deno.com/lint/rules/no-empty-pattern
   * @tags recommended
   */
  NoEmptyPattern = "no-empty-pattern",
  /**
   * Represents the `no-eval` linting rule.
   * @see https://docs.deno.com/lint/rules/no-eval
   */
  NoEval = "no-eval",
  /**
   * Represents the `no-ex-assign` linting rule.
   * @see https://docs.deno.com/lint/rules/no-ex-assign
   * @tags recommended
   */
  NoExAssign = "no-ex-assign",
  /**
   * Represents the `no-explicit-any` linting rule.
   * @see https://docs.deno.com/lint/rules/no-explicit-any
   * @tags recommended
   */
  NoExplicitAny = "no-explicit-any",
  /**
   * Represents the `no-external-import` linting rule.
   * @see https://docs.deno.com/lint/rules/no-external-import
   */
  NoExternalImport = "no-external-import",
  /**
   * Represents the `no-extra-boolean-cast` linting rule.
   * @see https://docs.deno.com/lint/rules/no-extra-boolean-cast
   * @tags recommended
   */
  NoExtraBooleanCast = "no-extra-boolean-cast",
  /**
   * Represents the `no-extra-non-null-assertion` linting rule.
   * @see https://docs.deno.com/lint/rules/no-extra-non-null-assertion
   * @tags recommended
   */
  NoExtraNonNullAssertion = "no-extra-non-null-assertion",
  /**
   * Represents the `no-fallthrough` linting rule.
   * @see https://docs.deno.com/lint/rules/no-fallthrough
   * @tags recommended
   */
  NoFallthrough = "no-fallthrough",
  /**
   * Represents the `no-func-assign` linting rule.
   * @see https://docs.deno.com/lint/rules/no-func-assign
   * @tags recommended
   */
  NoFuncAssign = "no-func-assign",
  /**
   * Represents the `no-global-assign` linting rule.
   * @see https://docs.deno.com/lint/rules/no-global-assign
   * @tags recommended
   */
  NoGlobalAssign = "no-global-assign",
  /**
   * Represents the `no-implicit-declare-namespace-export` linting rule.
   * @see https://docs.deno.com/lint/rules/no-implicit-declare-namespace-export
   */
  NoImplicitDeclareNamespaceExport = "no-implicit-declare-namespace-export",
  /**
   * Represents the `no-import-assertions` linting rule.
   * @see https://docs.deno.com/lint/rules/no-import-assertions
   * @tags recommended
   */
  NoImportAssertions = "no-import-assertions",
  /**
   * Represents the `no-import-assign` linting rule.
   * @see https://docs.deno.com/lint/rules/no-import-assign
   * @tags recommended
   */
  NoImportAssign = "no-import-assign",
  /**
   * Represents the `no-inferrable-types` linting rule.
   * @see https://docs.deno.com/lint/rules/no-inferrable-types
   */
  NoInferrableTypes = "no-inferrable-types",
  /**
   * Represents the `no-inner-declarations` linting rule.
   * @see https://docs.deno.com/lint/rules/no-inner-declarations
   * @tags recommended
   */
  NoInnerDeclarations = "no-inner-declarations",
  /**
   * Represents the `no-invalid-regexp` linting rule.
   * @see https://docs.deno.com/lint/rules/no-invalid-regexp
   * @tags recommended
   */
  NoInvalidRegexp = "no-invalid-regexp",
  /**
   * Represents the `no-invalid-triple-slash-reference` linting rule.
   * @see https://docs.deno.com/lint/rules/no-invalid-triple-slash-reference
   * @tags recommended
   */
  NoInvalidTripleSlashReference = "no-invalid-triple-slash-reference",
  /**
   * Represents the `no-irregular-whitespace` linting rule.
   * @see https://docs.deno.com/lint/rules/no-irregular-whitespace
   * @tags recommended
   */
  NoIrregularWhitespace = "no-irregular-whitespace",
  /**
   * Represents the `no-misused-new` linting rule.
   * @see https://docs.deno.com/lint/rules/no-misused-new
   * @tags recommended
   */
  NoMisusedNew = "no-misused-new",
  /**
   * Represents the `no-namespace` linting rule.
   * @see https://docs.deno.com/lint/rules/no-namespace
   * @tags recommended
   */
  NoNamespace = "no-namespace",
  /**
   * Represents the `no-new-symbol` linting rule.
   * @see https://docs.deno.com/lint/rules/no-new-symbol
   * @tags recommended
   */
  NoNewSymbol = "no-new-symbol",
  /**
   * Represents the `no-node-globals` linting rule.
   * @see https://docs.deno.com/lint/rules/no-node-globals
   * @tags recommended
   */
  NoNodeGlobals = "no-node-globals",
  /**
   * Represents the `no-non-null-asserted-optional-chain` linting rule.
   * @see https://docs.deno.com/lint/rules/no-non-null-asserted-optional-chain
   */
  NoNonNullAssertedOptionalChain = "no-non-null-asserted-optional-chain",
  /**
   * Represents the `no-non-null-assertion` linting rule.
   * @see https://docs.deno.com/lint/rules/no-non-null-assertion
   */
  NoNonNullAssertion = "no-non-null-assertion",
  /**
   * Represents the `no-obj-calls` linting rule.
   * @see https://docs.deno.com/lint/rules/no-obj-calls
   * @tags recommended
   */
  NoObjCalls = "no-obj-calls",
  /**
   * Represents the `no-octal` linting rule.
   * @see https://docs.deno.com/lint/rules/no-octal
   * @tags recommended
   */
  NoOctal = "no-octal",
  /**
   * Represents the `no-process-global` linting rule.
   * @see https://docs.deno.com/lint/rules/no-process-global
   * @tags recommended
   */
  NoProcessGlobal = "no-process-global",
  /**
   * Represents the `no-prototype-builtins` linting rule.
   * @see https://docs.deno.com/lint/rules/no-prototype-builtins
   * @tags recommended
   */
  NoPrototypeBuiltins = "no-prototype-builtins",
  /**
   * Represents the `no-redeclare` linting rule.
   * @see https://docs.deno.com/lint/rules/no-redeclare
   * @tags recommended
   */
  NoRedeclare = "no-redeclare",
  /**
   * Represents the `no-regex-spaces` linting rule.
   * @see https://docs.deno.com/lint/rules/no-regex-spaces
   * @tags recommended
   */
  NoRegexSpaces = "no-regex-spaces",
  /**
   * Represents the `no-self-assign` linting rule.
   * @see https://docs.deno.com/lint/rules/no-self-assign
   * @tags recommended
   */
  NoSelfAssign = "no-self-assign",
  /**
   * Represents the `no-self-compare` linting rule.
   * @see https://docs.deno.com/lint/rules/no-self-compare
   */
  NoSelfCompare = "no-self-compare",
  /**
   * Represents the `no-setter-return` linting rule.
   * @see https://docs.deno.com/lint/rules/no-setter-return
   * @tags recommended
   */
  NoSetterReturn = "no-setter-return",
  /**
   * Represents the `no-shadow-restricted-names` linting rule.
   * @see https://docs.deno.com/lint/rules/no-shadow-restricted-names
   * @tags recommended
   */
  NoShadowRestrictedNames = "no-shadow-restricted-names",
  /**
   * Represents the `no-sparse-arrays` linting rule.
   * @see https://docs.deno.com/lint/rules/no-sparse-arrays
   */
  NoSparseArrays = "no-sparse-arrays",
  /**
   * Represents the `no-sync-fn-in-async-fn` linting rule.
   * @see https://docs.deno.com/lint/rules/no-sync-fn-in-async-fn
   */
  NoSyncFnInAsyncFn = "no-sync-fn-in-async-fn",
  /**
   * Represents the `no-this-alias` linting rule.
   * @see https://docs.deno.com/lint/rules/no-this-alias
   * @tags recommended
   */
  NoThisAlias = "no-this-alias",
  /**
   * Represents the `no-this-before-super` linting rule.
   * @see https://docs.deno.com/lint/rules/no-this-before-super
   * @tags recommended
   */
  NoThisBeforeSuper = "no-this-before-super",
  /**
   * Represents the `no-throw-literal` linting rule.
   * @see https://docs.deno.com/lint/rules/no-throw-literal
   */
  NoThrowLiteral = "no-throw-literal",
  /**
   * Represents the `no-top-level-await` linting rule.
   * @see https://docs.deno.com/lint/rules/no-top-level-await
   */
  NoTopLevelAwait = "no-top-level-await",
  /**
   * Represents the `no-undef` linting rule.
   * @see https://docs.deno.com/lint/rules/no-undef
   */
  NoUndef = "no-undef",
  /**
   * Represents the `no-unreachable` linting rule.
   * @see https://docs.deno.com/lint/rules/no-unreachable
   * @tags recommended
   */
  NoUnreachable = "no-unreachable",
  /**
   * Represents the `no-unsafe-finally` linting rule.
   * @see https://docs.deno.com/lint/rules/no-unsafe-finally
   * @tags recommended
   */
  NoUnsafeFinally = "no-unsafe-finally",
  /**
   * Represents the `no-unsafe-negation` linting rule.
   * @see https://docs.deno.com/lint/rules/no-unsafe-negation
   * @tags recommended
   */
  NoUnsafeNegation = "no-unsafe-negation",
  /**
   * Represents the `no-unused-labels` linting rule.
   * @see https://docs.deno.com/lint/rules/no-unused-labels
   * @tags recommended
   */
  NoUnusedLabels = "no-unused-labels",
  /**
   * Represents the `no-unused-vars` linting rule.
   * @see https://docs.deno.com/lint/rules/no-unused-vars
   * @tags recommended
   */
  NoUnusedVars = "no-unused-vars",
  /**
   * Represents the `no-useless-rename` linting rule.
   * @see https://docs.deno.com/lint/rules/no-useless-rename
   */
  NoUselessRename = "no-useless-rename",
  /**
   * Represents the `no-var` linting rule.
   * @see https://docs.deno.com/lint/rules/no-var
   * @tags recommended
   */
  NoVar = "no-var",
  /**
   * Represents the `no-window` linting rule.
   * @see https://docs.deno.com/lint/rules/no-window
   * @tags recommended
   */
  NoWindow = "no-window",
  /**
   * Represents the `no-window-prefix` linting rule.
   * @see https://docs.deno.com/lint/rules/no-window-prefix
   * @tags recommended
   */
  NoWindowPrefix = "no-window-prefix",
  /**
   * Represents the `no-with` linting rule.
   * @see https://docs.deno.com/lint/rules/no-with
   * @tags recommended
   */
  NoWith = "no-with",
  /**
   * Represents the `prefer-as-const` linting rule.
   * @see https://docs.deno.com/lint/rules/prefer-as-const
   * @tags recommended
   */
  PreferAsConst = "prefer-as-const",
  /**
   * Represents the `prefer-ascii` linting rule.
   * @see https://docs.deno.com/lint/rules/prefer-ascii
   */
  PreferAscii = "prefer-ascii",
  /**
   * Represents the `prefer-const` linting rule.
   * @see https://docs.deno.com/lint/rules/prefer-const
   * @tags recommended
   */
  PreferConst = "prefer-const",
  /**
   * Represents the `prefer-namespace-keyword` linting rule.
   * @see https://docs.deno.com/lint/rules/prefer-namespace-keyword
   * @tags recommended
   */
  PreferNamespaceKeyword = "prefer-namespace-keyword",
  /**
   * Represents the `prefer-primordials` linting rule.
   * @see https://docs.deno.com/lint/rules/prefer-primordials
   */
  PreferPrimordials = "prefer-primordials",
  /**
   * Represents the `react-no-danger` linting rule.
   * @see https://docs.deno.com/lint/rules/react-no-danger
   * @tags fresh,react
   */
  ReactNoDanger = "react-no-danger",
  /**
   * Represents the `react-no-danger-with-children` linting rule.
   * @see https://docs.deno.com/lint/rules/react-no-danger-with-children
   * @tags fresh,react
   */
  ReactNoDangerWithChildren = "react-no-danger-with-children",
  /**
   * Represents the `react-rules-of-hooks` linting rule.
   * @see https://docs.deno.com/lint/rules/react-rules-of-hooks
   * @tags fresh,react
   */
  ReactRulesOfHooks = "react-rules-of-hooks",
  /**
   * Represents the `require-await` linting rule.
   * @see https://docs.deno.com/lint/rules/require-await
   * @tags recommended
   */
  RequireAwait = "require-await",
  /**
   * Represents the `require-yield` linting rule.
   * @see https://docs.deno.com/lint/rules/require-yield
   * @tags recommended
   */
  RequireYield = "require-yield",
  /**
   * Represents the `single-var-declarator` linting rule.
   * @see https://docs.deno.com/lint/rules/single-var-declarator
   */
  SingleVarDeclarator = "single-var-declarator",
  /**
   * Represents the `triple-slash-reference` linting rule.
   * @see https://docs.deno.com/lint/rules/triple-slash-reference
   */
  TripleSlashReference = "triple-slash-reference",
  /**
   * Represents the `use-isnan` linting rule.
   * @see https://docs.deno.com/lint/rules/use-isnan
   * @tags recommended
   */
  UseIsnan = "use-isnan",
  /**
   * Represents the `valid-typeof` linting rule.
   * @see https://docs.deno.com/lint/rules/valid-typeof
   * @tags recommended
   */
  ValidTypeof = "valid-typeof",
  /**
   * Represents the `verbatim-module-syntax` linting rule.
   * @see https://docs.deno.com/lint/rules/verbatim-module-syntax
   * @tags jsr
   */
  VerbatimModuleSyntax = "verbatim-module-syntax",
}

// deno-lint-ignore-file no-namespace
/**
 * The `Rule` namespace contains type aliases for each of the available
 * diagnostic tags, which contain unions of all the rules included in that
 * tag. These type aliases are useful for type-checking and implementing
 * custom rule configurations.
 */
export declare namespace Rule {
  export type Fresh =
    | Rule.FreshHandlerExport
    | Rule.FreshServerEventHandlers
    | Rule.JsxButtonHasType
    | Rule.JsxNoChildrenProp
    | Rule.JsxNoCommentTextNodes
    | Rule.JsxNoUnescapedEntities
    | Rule.JsxNoUselessFragment
    | Rule.JsxVoidDomElementsNoChildren
    | Rule.ReactNoDanger
    | Rule.ReactNoDangerWithChildren
    | Rule.ReactRulesOfHooks;
  export type JSR = Rule.VerbatimModuleSyntax;
  export type JSX =
    | Rule.JsxBooleanValue
    | Rule.JsxButtonHasType
    | Rule.JsxCurlyBraces
    | Rule.JsxKey
    | Rule.JsxNoChildrenProp
    | Rule.JsxNoCommentTextNodes
    | Rule.JsxNoDuplicateProps
    | Rule.JsxNoUnescapedEntities
    | Rule.JsxNoUselessFragment
    | Rule.JsxPropsNoSpreadMulti
    | Rule.JsxVoidDomElementsNoChildren;
  export type React =
    | Rule.JsxBooleanValue
    | Rule.JsxButtonHasType
    | Rule.JsxCurlyBraces
    | Rule.JsxKey
    | Rule.JsxNoChildrenProp
    | Rule.JsxNoCommentTextNodes
    | Rule.JsxNoDuplicateProps
    | Rule.JsxNoUnescapedEntities
    | Rule.JsxNoUselessFragment
    | Rule.JsxPropsNoSpreadMulti
    | Rule.JsxVoidDomElementsNoChildren
    | Rule.ReactNoDanger
    | Rule.ReactNoDangerWithChildren
    | Rule.ReactRulesOfHooks;
  export type Recommended =
    | Rule.AdjacentOverloadSignatures
    | Rule.BanTsComment
    | Rule.BanTypes
    | Rule.BanUnknownRuleCode
    | Rule.BanUntaggedIgnore
    | Rule.BanUnusedIgnore
    | Rule.ConstructorSuper
    | Rule.ForDirection
    | Rule.GetterReturn
    | Rule.JsxBooleanValue
    | Rule.JsxButtonHasType
    | Rule.JsxCurlyBraces
    | Rule.JsxKey
    | Rule.JsxNoChildrenProp
    | Rule.JsxNoCommentTextNodes
    | Rule.JsxNoDuplicateProps
    | Rule.JsxNoUnescapedEntities
    | Rule.JsxNoUselessFragment
    | Rule.JsxPropsNoSpreadMulti
    | Rule.JsxVoidDomElementsNoChildren
    | Rule.NoArrayConstructor
    | Rule.NoAsyncPromiseExecutor
    | Rule.NoAwaitInSyncFn
    | Rule.NoCaseDeclarations
    | Rule.NoClassAssign
    | Rule.NoCompareNegZero
    | Rule.NoCondAssign
    | Rule.NoConstantCondition
    | Rule.NoControlRegex
    | Rule.NoDebugger
    | Rule.NoDeleteVar
    | Rule.NoDeprecatedDenoApi
    | Rule.NoDupeArgs
    | Rule.NoDupeClassMembers
    | Rule.NoDupeElseIf
    | Rule.NoDupeKeys
    | Rule.NoDuplicateCase
    | Rule.NoEmpty
    | Rule.NoEmptyCharacterClass
    | Rule.NoEmptyEnum
    | Rule.NoEmptyInterface
    | Rule.NoEmptyPattern
    | Rule.NoExAssign
    | Rule.NoExplicitAny
    | Rule.NoExtraBooleanCast
    | Rule.NoExtraNonNullAssertion
    | Rule.NoFallthrough
    | Rule.NoFuncAssign
    | Rule.NoGlobalAssign
    | Rule.NoImportAssertions
    | Rule.NoImportAssign
    | Rule.NoInnerDeclarations
    | Rule.NoInvalidRegexp
    | Rule.NoInvalidTripleSlashReference
    | Rule.NoIrregularWhitespace
    | Rule.NoMisusedNew
    | Rule.NoNamespace
    | Rule.NoNewSymbol
    | Rule.NoNodeGlobals
    | Rule.NoObjCalls
    | Rule.NoOctal
    | Rule.NoProcessGlobal
    | Rule.NoPrototypeBuiltins
    | Rule.NoRedeclare
    | Rule.NoRegexSpaces
    | Rule.NoSelfAssign
    | Rule.NoSetterReturn
    | Rule.NoShadowRestrictedNames
    | Rule.NoThisAlias
    | Rule.NoThisBeforeSuper
    | Rule.NoUnreachable
    | Rule.NoUnsafeFinally
    | Rule.NoUnsafeNegation
    | Rule.NoUnusedLabels
    | Rule.NoUnusedVars
    | Rule.NoVar
    | Rule.NoWindow
    | Rule.NoWindowPrefix
    | Rule.NoWith
    | Rule.PreferAsConst
    | Rule.PreferConst
    | Rule.PreferNamespaceKeyword
    | Rule.RequireAwait
    | Rule.RequireYield
    | Rule.UseIsnan
    | Rule.ValidTypeof;

  export type FromTag<T> =
    | T extends Tag.Recommended ? Rule.Recommended
    : T extends Tag.Fresh ? Rule.Fresh
    : T extends Tag.JSR ? Rule.JSR
    : T extends Tag.JSX ? Rule.JSX
    : T extends Tag.React ? Rule.React
    : Rule;
}

/**
 * The `Tag` enum represents all of the supported diagnostic grouping tags
 * in the current version of the `deno lint` engine. Tags are used to
 * group rules by category or purpose, allowing users to filter, enable,
 * or disable multiple rules at once.
 *
 * @category Core
 */
export enum Tag {
  /**
   * Represents the `fresh` diagnostic tag.
   *
   * **Rules included in this tag**:
   *
   * - {@linkcode Rule.FreshHandlerExport|fresh-handler-export}
   * - {@linkcode Rule.FreshServerEventHandlers|fresh-server-event-handlers}
   * - {@linkcode Rule.JsxButtonHasType|jsx-button-has-type}
   * - {@linkcode Rule.JsxNoChildrenProp|jsx-no-children-prop}
   * - {@linkcode Rule.JsxNoCommentTextNodes|jsx-no-comment-text-nodes}
   * - {@linkcode Rule.JsxNoUnescapedEntities|jsx-no-unescaped-entities}
   * - {@linkcode Rule.JsxNoUselessFragment|jsx-no-useless-fragment}
   * - {@linkcode Rule.JsxVoidDomElementsNoChildren|jsx-void-dom-elements-no-children}
   * - {@linkcode Rule.ReactNoDanger|react-no-danger}
   * - {@linkcode Rule.ReactNoDangerWithChildren|react-no-danger-with-children}
   * - {@linkcode Rule.ReactRulesOfHooks|react-rules-of-hooks}
   *
   * @see https://docs.deno.com/lint/tags/fresh
   */
  Fresh = "fresh",
  /**
   * Represents the `jsr` diagnostic tag.
   *
   * **Rules included in this tag**:
   *
   * - {@linkcode Rule.VerbatimModuleSyntax|verbatim-module-syntax}
   *
   * @see https://docs.deno.com/lint/tags/jsr
   */
  JSR = "jsr",
  /**
   * Represents the `jsx` diagnostic tag.
   *
   * **Rules included in this tag**:
   *
   * - {@linkcode Rule.JsxBooleanValue|jsx-boolean-value}
   * - {@linkcode Rule.JsxButtonHasType|jsx-button-has-type}
   * - {@linkcode Rule.JsxCurlyBraces|jsx-curly-braces}
   * - {@linkcode Rule.JsxKey|jsx-key}
   * - {@linkcode Rule.JsxNoChildrenProp|jsx-no-children-prop}
   * - {@linkcode Rule.JsxNoCommentTextNodes|jsx-no-comment-text-nodes}
   * - {@linkcode Rule.JsxNoDuplicateProps|jsx-no-duplicate-props}
   * - {@linkcode Rule.JsxNoUnescapedEntities|jsx-no-unescaped-entities}
   * - {@linkcode Rule.JsxNoUselessFragment|jsx-no-useless-fragment}
   * - {@linkcode Rule.JsxPropsNoSpreadMulti|jsx-props-no-spread-multi}
   * - {@linkcode Rule.JsxVoidDomElementsNoChildren|jsx-void-dom-elements-no-children}
   *
   * @see https://docs.deno.com/lint/tags/jsx
   */
  JSX = "jsx",
  /**
   * Represents the `react` diagnostic tag.
   *
   * **Rules included in this tag**:
   *
   * - {@linkcode Rule.JsxBooleanValue|jsx-boolean-value}
   * - {@linkcode Rule.JsxButtonHasType|jsx-button-has-type}
   * - {@linkcode Rule.JsxCurlyBraces|jsx-curly-braces}
   * - {@linkcode Rule.JsxKey|jsx-key}
   * - {@linkcode Rule.JsxNoChildrenProp|jsx-no-children-prop}
   * - {@linkcode Rule.JsxNoCommentTextNodes|jsx-no-comment-text-nodes}
   * - {@linkcode Rule.JsxNoDuplicateProps|jsx-no-duplicate-props}
   * - {@linkcode Rule.JsxNoUnescapedEntities|jsx-no-unescaped-entities}
   * - {@linkcode Rule.JsxNoUselessFragment|jsx-no-useless-fragment}
   * - {@linkcode Rule.JsxPropsNoSpreadMulti|jsx-props-no-spread-multi}
   * - {@linkcode Rule.JsxVoidDomElementsNoChildren|jsx-void-dom-elements-no-children}
   * - {@linkcode Rule.ReactNoDanger|react-no-danger}
   * - {@linkcode Rule.ReactNoDangerWithChildren|react-no-danger-with-children}
   * - {@linkcode Rule.ReactRulesOfHooks|react-rules-of-hooks}
   *
   * @see https://docs.deno.com/lint/tags/react
   */
  React = "react",
  /**
   * Represents the `recommended` diagnostic tag.
   *
   * **Rules included in this tag**:
   *
   * - {@linkcode Rule.AdjacentOverloadSignatures|adjacent-overload-signatures}
   * - {@linkcode Rule.BanTsComment|ban-ts-comment}
   * - {@linkcode Rule.BanTypes|ban-types}
   * - {@linkcode Rule.BanUnknownRuleCode|ban-unknown-rule-code}
   * - {@linkcode Rule.BanUntaggedIgnore|ban-untagged-ignore}
   * - {@linkcode Rule.BanUnusedIgnore|ban-unused-ignore}
   * - {@linkcode Rule.ConstructorSuper|constructor-super}
   * - {@linkcode Rule.ForDirection|for-direction}
   * - {@linkcode Rule.GetterReturn|getter-return}
   * - {@linkcode Rule.JsxBooleanValue|jsx-boolean-value}
   * - {@linkcode Rule.JsxButtonHasType|jsx-button-has-type}
   * - {@linkcode Rule.JsxCurlyBraces|jsx-curly-braces}
   * - {@linkcode Rule.JsxKey|jsx-key}
   * - {@linkcode Rule.JsxNoChildrenProp|jsx-no-children-prop}
   * - {@linkcode Rule.JsxNoCommentTextNodes|jsx-no-comment-text-nodes}
   * - {@linkcode Rule.JsxNoDuplicateProps|jsx-no-duplicate-props}
   * - {@linkcode Rule.JsxNoUnescapedEntities|jsx-no-unescaped-entities}
   * - {@linkcode Rule.JsxNoUselessFragment|jsx-no-useless-fragment}
   * - {@linkcode Rule.JsxPropsNoSpreadMulti|jsx-props-no-spread-multi}
   * - {@linkcode Rule.JsxVoidDomElementsNoChildren|jsx-void-dom-elements-no-children}
   * - {@linkcode Rule.NoArrayConstructor|no-array-constructor}
   * - {@linkcode Rule.NoAsyncPromiseExecutor|no-async-promise-executor}
   * - {@linkcode Rule.NoAwaitInSyncFn|no-await-in-sync-fn}
   * - {@linkcode Rule.NoCaseDeclarations|no-case-declarations}
   * - {@linkcode Rule.NoClassAssign|no-class-assign}
   * - {@linkcode Rule.NoCompareNegZero|no-compare-neg-zero}
   * - {@linkcode Rule.NoCondAssign|no-cond-assign}
   * - {@linkcode Rule.NoConstantCondition|no-constant-condition}
   * - {@linkcode Rule.NoControlRegex|no-control-regex}
   * - {@linkcode Rule.NoDebugger|no-debugger}
   * - {@linkcode Rule.NoDeleteVar|no-delete-var}
   * - {@linkcode Rule.NoDeprecatedDenoApi|no-deprecated-deno-api}
   * - {@linkcode Rule.NoDupeArgs|no-dupe-args}
   * - {@linkcode Rule.NoDupeClassMembers|no-dupe-class-members}
   * - {@linkcode Rule.NoDupeElseIf|no-dupe-else-if}
   * - {@linkcode Rule.NoDupeKeys|no-dupe-keys}
   * - {@linkcode Rule.NoDuplicateCase|no-duplicate-case}
   * - {@linkcode Rule.NoEmpty|no-empty}
   * - {@linkcode Rule.NoEmptyCharacterClass|no-empty-character-class}
   * - {@linkcode Rule.NoEmptyEnum|no-empty-enum}
   * - {@linkcode Rule.NoEmptyInterface|no-empty-interface}
   * - {@linkcode Rule.NoEmptyPattern|no-empty-pattern}
   * - {@linkcode Rule.NoExAssign|no-ex-assign}
   * - {@linkcode Rule.NoExplicitAny|no-explicit-any}
   * - {@linkcode Rule.NoExtraBooleanCast|no-extra-boolean-cast}
   * - {@linkcode Rule.NoExtraNonNullAssertion|no-extra-non-null-assertion}
   * - {@linkcode Rule.NoFallthrough|no-fallthrough}
   * - {@linkcode Rule.NoFuncAssign|no-func-assign}
   * - {@linkcode Rule.NoGlobalAssign|no-global-assign}
   * - {@linkcode Rule.NoImportAssertions|no-import-assertions}
   * - {@linkcode Rule.NoImportAssign|no-import-assign}
   * - {@linkcode Rule.NoInnerDeclarations|no-inner-declarations}
   * - {@linkcode Rule.NoInvalidRegexp|no-invalid-regexp}
   * - {@linkcode Rule.NoInvalidTripleSlashReference|no-invalid-triple-slash-reference}
   * - {@linkcode Rule.NoIrregularWhitespace|no-irregular-whitespace}
   * - {@linkcode Rule.NoMisusedNew|no-misused-new}
   * - {@linkcode Rule.NoNamespace|no-namespace}
   * - {@linkcode Rule.NoNewSymbol|no-new-symbol}
   * - {@linkcode Rule.NoNodeGlobals|no-node-globals}
   * - {@linkcode Rule.NoObjCalls|no-obj-calls}
   * - {@linkcode Rule.NoOctal|no-octal}
   * - {@linkcode Rule.NoProcessGlobal|no-process-global}
   * - {@linkcode Rule.NoPrototypeBuiltins|no-prototype-builtins}
   * - {@linkcode Rule.NoRedeclare|no-redeclare}
   * - {@linkcode Rule.NoRegexSpaces|no-regex-spaces}
   * - {@linkcode Rule.NoSelfAssign|no-self-assign}
   * - {@linkcode Rule.NoSetterReturn|no-setter-return}
   * - {@linkcode Rule.NoShadowRestrictedNames|no-shadow-restricted-names}
   * - {@linkcode Rule.NoThisAlias|no-this-alias}
   * - {@linkcode Rule.NoThisBeforeSuper|no-this-before-super}
   * - {@linkcode Rule.NoUnreachable|no-unreachable}
   * - {@linkcode Rule.NoUnsafeFinally|no-unsafe-finally}
   * - {@linkcode Rule.NoUnsafeNegation|no-unsafe-negation}
   * - {@linkcode Rule.NoUnusedLabels|no-unused-labels}
   * - {@linkcode Rule.NoUnusedVars|no-unused-vars}
   * - {@linkcode Rule.NoVar|no-var}
   * - {@linkcode Rule.NoWindow|no-window}
   * - {@linkcode Rule.NoWindowPrefix|no-window-prefix}
   * - {@linkcode Rule.NoWith|no-with}
   * - {@linkcode Rule.PreferAsConst|prefer-as-const}
   * - {@linkcode Rule.PreferConst|prefer-const}
   * - {@linkcode Rule.PreferNamespaceKeyword|prefer-namespace-keyword}
   * - {@linkcode Rule.RequireAwait|require-await}
   * - {@linkcode Rule.RequireYield|require-yield}
   * - {@linkcode Rule.UseIsnan|use-isnan}
   * - {@linkcode Rule.ValidTypeof|valid-typeof}
   *
   * @see https://docs.deno.com/lint/tags/recommended
   */
  Recommended = "recommended",
  /**
   * Alias for the `"recommended"` tag.
   *
   * @see {@linkcode Tag.Recommended}
   */
  Default = "recommended",
}

// deno-lint-ignore no-namespace
export namespace Tag {
  /**
   * Represents a key of the {@linkcode Tag} enum. For example,
   * {@linkcode Tag.JSR} (`"jsr"`) has the key `"JSR"`.
   *
   * @category Types
   * @tags tags, keys
   */
  export type Key = EnumKey<Tag, typeof Tag>;

  /**
   * Represents an untyped tag "name", which is a string literal that
   * has the same value as a {@linkcode Tag} enum value. At runtime these
   * are indistinguishable from {@linkcode Tag} enum values (that is, they
   * are the exact same thing). At compile-time, however, TypeScript treats
   * the two as distinct types that are incompatible with each other.
   *
   * @category Types
   * @tags tags, names
   */
  export type Name = `${Tag}`;

  /**
   * Represents a tag-like value, which is a relaxed form of {@linkcode Tag}
   * that includes the {@linkcode Tag} enum itself and string literals that
   * satisfy either the {@linkcode Tag.Key} or {@linkcode Tag.Name} types.
   *
   * @category Types
   * @tags tags, keys, names
   */
  export type Like = Tag | Name | Key;

  /**
   * Checks whether the given value is a valid diagnostic tag.
   *
   * @param it The value to check.
   * @returns `true` if the value is a valid tag, `false` otherwise.
   * @category Guards
   * @tags tags
   */
  export function is(it: unknown): it is Tag {
    return typeof it === "string" && Tag.getAllTags().includes(it as Tag);
  }

  /**
   * Checks whether the given value is a valid {@linkcode Tag.Key}.
   *
   * @param it The value to check.
   * @returns `true` if the value is a valid tag key, `false` otherwise.
   * @category Guards
   * @tags tags, keys
   */
  export function isKey(it: unknown): it is Tag.Key {
    return typeof it === "string" && it in Tag && Tag.is(Tag[it as Tag.Key]);
  }

  /**
   * Checks whether the given value is a valid {@linkcode Tag.Like} value.
   *
   * @param it The value to check.
   * @returns `true` if the value is a valid tag-like value, `false` otherwise.
   * @category Guards
   * @tags tags, keys, names
   */
  export function isTagLike(it: unknown): it is Tag.Like {
    return Tag.is(it) || Tag.isKey(it);
  }

  /**
   * Returns an iterable iterator that yields all available diagnostic tags.
   *
   * @returns An iterable iterator of all available diagnostic tags.
   * @category Tags
   */
  export function* allTags(): IterableIterator<Tag> {
    return yield* wasm.getAllTags() as Iterable<Tag>;
  }

  /**
   * Returns an array of all available diagnostic tags.
   *
   * @returns An array of all available diagnostic tags.
   * @category Tags
   */
  export function getAllTags(): readonly Tag[] {
    return [...allTags()];
  }

  /**
   * Converts the given value to a {@linkcode Tag} enum value, if possible.
   * If the value cannot be converted, an error is thrown.
   *
   * @param value The value to convert.
   * @returns The converted {@linkcode Tag} enum value.
   * @throws {TypeError} If the conversion fails.
   * @category Conversion
   * @tags tags
   */
  export function from(value: unknown): Tag {
    if (typeof value === "string") {
      value = value.trim();
      if (Tag.isKey(value)) return Tag[value];
      value = (value as string).toLowerCase();
      if (Tag.is(value)) return value;
    }
    throw new TypeError(
      `Invalid tag value: ${value}\n\nAvailable tags:\n - ${
        Tag.getAllTags().join("\n - ")
      }\n`,
    );
  }

  /**
   * Attempts to convert the given value to a {@linkcode Tag} enum value,
   * returning `undefined` if the conversion fails. This is a convenience
   * wrapper around the {@linkcode Tag.from} function, which throws an error if
   * the input value cannot be converted to a tag.
   *
   * @param value The value to convert.
   * @returns The converted {@linkcode Tag} enum value, or `undefined` if the
   * conversion fails.
   * @category Conversion
   * @tags tags
   */
  export function tryFrom(value: unknown): Tag | undefined {
    try {
      return Tag.from(value);
    } catch (err) {
      if (err instanceof TypeError && err.message.startsWith("Invalid tag")) {
        return undefined;
      } else {
        throw err;
      }
    }
  }
}

/**
 * Represents a "tag-like" value, which is a relaxed form of {@linkcode Tag}
 * that includes the {@linkcode Tag} enum itself and string literals that
 * satisfy either the {@linkcode Tag.Key} or {@linkcode Tag.Name} types.
 *
 * @category Types
 */
export type TagLike = Tag | `${Tag}` | strings;

/**
 * Represents a "rule-like" value, which is a relaxed form of {@linkcode Rule}
 * that includes the {@linkcode Rule} enum itself while also allowing other
 * string literals that are not defined in the enum.
 *
 * @category Types
 */
export type RuleLike = Rule | `${Rule}` | strings;
