// @generated file from wasmbuild -- do not edit
// @ts-nocheck: generated
// deno-lint-ignore-file
// deno-fmt-ignore-file

import {
  read_dir,
  read_file,
  read_text_file,
  stat,
  vfs,
  write_file,
  write_text_file,
} from "./snippets/dlint-2313e7089bf34f70/ext/fs.js";
import { process } from "./snippets/dlint-2313e7089bf34f70/ext/process.js";
import { performance } from "./snippets/dlint-2313e7089bf34f70/ext/timing.js";

let wasm;
export function __wbg_set_wasm(val) {
  wasm = val;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

const lTextEncoder = typeof TextEncoder === "undefined"
  ? (0, module.require)("util").TextEncoder
  : TextEncoder;

let cachedTextEncoder = new lTextEncoder("utf-8");

const encodeString = typeof cachedTextEncoder.encodeInto === "function"
  ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
  }
  : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length,
    };
  };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}

function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_export_4.set(idx, obj);
  return idx;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}

const lTextDecoder = typeof TextDecoder === "undefined"
  ? (0, module.require)("util").TextDecoder
  : TextDecoder;

let cachedTextDecoder = new lTextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: false,
});

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len),
  );
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}
/**
 * Returns the version of the `deno_lint` crate used to build this module.
 * @returns {string}
 */
export function deno_lint_version() {
  let deferred1_0;
  let deferred1_1;
  try {
    const ret = wasm.deno_lint_version();
    deferred1_0 = ret[0];
    deferred1_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
  }
}

function passArrayJsValueToWasm0(array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0;
  for (let i = 0; i < array.length; i++) {
    const add = addToExternrefTable0(array[i]);
    getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
  }
  WASM_VECTOR_LEN = array.length;
  return ptr;
}

function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_export_4.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
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
  code,
  maybe_filename,
  maybe_tags,
  maybe_exclude,
  maybe_include,
  maybe_custom_ignore_file_directive,
  maybe_custom_ignore_diagnostic_directive,
  maybe_default_jsx_factory,
  maybe_default_jsx_fragment_factory,
) {
  const ptr0 = passStringToWasm0(
    code,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(maybe_filename)
    ? 0
    : passStringToWasm0(
      maybe_filename,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = isLikeNone(maybe_tags)
    ? 0
    : passArrayJsValueToWasm0(maybe_tags, wasm.__wbindgen_malloc);
  var len2 = WASM_VECTOR_LEN;
  var ptr3 = isLikeNone(maybe_exclude)
    ? 0
    : passArrayJsValueToWasm0(maybe_exclude, wasm.__wbindgen_malloc);
  var len3 = WASM_VECTOR_LEN;
  var ptr4 = isLikeNone(maybe_include)
    ? 0
    : passArrayJsValueToWasm0(maybe_include, wasm.__wbindgen_malloc);
  var len4 = WASM_VECTOR_LEN;
  var ptr5 = isLikeNone(maybe_custom_ignore_file_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_file_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len5 = WASM_VECTOR_LEN;
  var ptr6 = isLikeNone(maybe_custom_ignore_diagnostic_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_diagnostic_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len6 = WASM_VECTOR_LEN;
  var ptr7 = isLikeNone(maybe_default_jsx_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len7 = WASM_VECTOR_LEN;
  var ptr8 = isLikeNone(maybe_default_jsx_fragment_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_fragment_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len8 = WASM_VECTOR_LEN;
  const ret = wasm.lint(
    ptr0,
    len0,
    ptr1,
    len1,
    ptr2,
    len2,
    ptr3,
    len3,
    ptr4,
    len4,
    ptr5,
    len5,
    ptr6,
    len6,
    ptr7,
    len7,
    ptr8,
    len8,
  );
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}

/**
 * Applies the given fix to a source code string, returning the transformed
 * source code as a new string.
 * @param {string} source
 * @param {any} fix
 * @returns {string}
 */
export function applyFix(source, fix) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passStringToWasm0(
      source,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.applyFix(ptr0, len0, fix);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}

/**
 * Applies a single fix change to the given source code.
 *
 * If the change is out of range or fails to apply, an error is thrown.
 * Otherwise, the transformed source code is returned.
 *
 * @param {string} source The source code to transform.
 * @param {LintFixChange} change The change to apply.
 * @returns {string} The transformed source code.
 */
export function applyFixChange(source, change) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passStringToWasm0(
      source,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.applyFixChange(ptr0, len0, change);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}

/**
 * Applies the first change from each of the given fixes to a source code
 * string, returning the transformed source code as a new string. If any of the
 * fixes fail to apply, an error will be thrown.
 * @param {string} source
 * @param {any[]} fixes
 * @returns {string}
 */
export function applyFixes(source, fixes) {
  let deferred4_0;
  let deferred4_1;
  try {
    const ptr0 = passStringToWasm0(
      source,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(fixes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.applyFixes(ptr0, len0, ptr1, len1);
    var ptr3 = ret[0];
    var len3 = ret[1];
    if (ret[3]) {
      ptr3 = 0;
      len3 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}

/**
 * Applies all of the changes from all of the provided fixes to a source code
 * string. Fixes are sorted by the start positions of their changes, and are
 * applied in reverse order to prevent subsequent fixes from overlapping.
 *
 * Each fix has its changes applied in the order they are provided. If any
 * of the fixes fail to apply, or if any of their ranges overlap, an error will
 * be thrown. Otherwise, the transformed string is returned.
 * @param {string} source
 * @param {any[]} fixes
 * @returns {string}
 */
export function applyAllFixes(source, fixes) {
  let deferred4_0;
  let deferred4_1;
  try {
    const ptr0 = passStringToWasm0(
      source,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(fixes, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.applyAllFixes(ptr0, len0, ptr1, len1);
    var ptr3 = ret[0];
    var len3 = ret[1];
    if (ret[3]) {
      ptr3 = 0;
      len3 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}

/**
 * Applies all of the changes from a given fix to a source code string.
 * @param {string} source
 * @param {any} fix
 * @returns {string}
 */
export function applyAllChanges(source, fix) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passStringToWasm0(
      source,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.applyAllChanges(ptr0, len0, fix);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}

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
export function compareChanges(a, b) {
  const ret = wasm.compareChanges(a, b);
  return ret;
}

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
export function compareChangesAsc(a, b) {
  const ret = wasm.compareChangesAsc(a, b);
  return ret;
}

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
export function compareFixes(a, b) {
  const ret = wasm.compareFixes(a, b);
  return ret;
}

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
export function compareFixesAsc(a, b) {
  const ret = wasm.compareFixesAsc(a, b);
  return ret;
}

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
export function sortFixes(fixes) {
  const ret = wasm.sortFixes(fixes);
  return ret;
}

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
export function sortFixesAsc(fixes) {
  const ret = wasm.sortFixesAsc(fixes);
  return ret;
}

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
export function sortFixesOverall(fixes) {
  const ret = wasm.sortFixesOverall(fixes);
  return ret;
}

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
export function sortFixesOverallAsc(fixes) {
  const ret = wasm.sortFixesOverallAsc(fixes);
  return ret;
}

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
  targets,
  maybe_tags,
  maybe_exclude,
  maybe_include,
  maybe_custom_ignore_file_directive,
  maybe_custom_ignore_diagnostic_directive,
  maybe_default_jsx_factory,
  maybe_default_jsx_fragment_factory,
) {
  const ptr0 = passArrayJsValueToWasm0(targets, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(maybe_tags)
    ? 0
    : passArrayJsValueToWasm0(maybe_tags, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = isLikeNone(maybe_exclude)
    ? 0
    : passArrayJsValueToWasm0(maybe_exclude, wasm.__wbindgen_malloc);
  var len2 = WASM_VECTOR_LEN;
  var ptr3 = isLikeNone(maybe_include)
    ? 0
    : passArrayJsValueToWasm0(maybe_include, wasm.__wbindgen_malloc);
  var len3 = WASM_VECTOR_LEN;
  var ptr4 = isLikeNone(maybe_custom_ignore_file_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_file_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len4 = WASM_VECTOR_LEN;
  var ptr5 = isLikeNone(maybe_custom_ignore_diagnostic_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_diagnostic_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len5 = WASM_VECTOR_LEN;
  var ptr6 = isLikeNone(maybe_default_jsx_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len6 = WASM_VECTOR_LEN;
  var ptr7 = isLikeNone(maybe_default_jsx_fragment_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_fragment_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len7 = WASM_VECTOR_LEN;
  const ret = wasm.fixFiles(
    ptr0,
    len0,
    ptr1,
    len1,
    ptr2,
    len2,
    ptr3,
    len3,
    ptr4,
    len4,
    ptr5,
    len5,
    ptr6,
    len6,
    ptr7,
    len7,
  );
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}

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
  targets,
  maybe_tags,
  maybe_exclude,
  maybe_include,
  maybe_custom_ignore_file_directive,
  maybe_custom_ignore_diagnostic_directive,
  maybe_default_jsx_factory,
  maybe_default_jsx_fragment_factory,
) {
  const ptr0 = passArrayJsValueToWasm0(targets, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(maybe_tags)
    ? 0
    : passArrayJsValueToWasm0(maybe_tags, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = isLikeNone(maybe_exclude)
    ? 0
    : passArrayJsValueToWasm0(maybe_exclude, wasm.__wbindgen_malloc);
  var len2 = WASM_VECTOR_LEN;
  var ptr3 = isLikeNone(maybe_include)
    ? 0
    : passArrayJsValueToWasm0(maybe_include, wasm.__wbindgen_malloc);
  var len3 = WASM_VECTOR_LEN;
  var ptr4 = isLikeNone(maybe_custom_ignore_file_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_file_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len4 = WASM_VECTOR_LEN;
  var ptr5 = isLikeNone(maybe_custom_ignore_diagnostic_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_diagnostic_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len5 = WASM_VECTOR_LEN;
  var ptr6 = isLikeNone(maybe_default_jsx_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len6 = WASM_VECTOR_LEN;
  var ptr7 = isLikeNone(maybe_default_jsx_fragment_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_fragment_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len7 = WASM_VECTOR_LEN;
  const ret = wasm.fixFilesInPlace(
    ptr0,
    len0,
    ptr1,
    len1,
    ptr2,
    len2,
    ptr3,
    len3,
    ptr4,
    len4,
    ptr5,
    len5,
    ptr6,
    len6,
    ptr7,
    len7,
  );
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}

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
  specifier,
  maybe_tags,
  maybe_exclude,
  maybe_include,
  maybe_custom_ignore_file_directive,
  maybe_custom_ignore_diagnostic_directive,
  maybe_default_jsx_factory,
  maybe_default_jsx_fragment_factory,
) {
  const ptr0 = passStringToWasm0(
    specifier,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(maybe_tags)
    ? 0
    : passArrayJsValueToWasm0(maybe_tags, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = isLikeNone(maybe_exclude)
    ? 0
    : passArrayJsValueToWasm0(maybe_exclude, wasm.__wbindgen_malloc);
  var len2 = WASM_VECTOR_LEN;
  var ptr3 = isLikeNone(maybe_include)
    ? 0
    : passArrayJsValueToWasm0(maybe_include, wasm.__wbindgen_malloc);
  var len3 = WASM_VECTOR_LEN;
  var ptr4 = isLikeNone(maybe_custom_ignore_file_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_file_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len4 = WASM_VECTOR_LEN;
  var ptr5 = isLikeNone(maybe_custom_ignore_diagnostic_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_diagnostic_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len5 = WASM_VECTOR_LEN;
  var ptr6 = isLikeNone(maybe_default_jsx_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len6 = WASM_VECTOR_LEN;
  var ptr7 = isLikeNone(maybe_default_jsx_fragment_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_fragment_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len7 = WASM_VECTOR_LEN;
  const ret = wasm.lintFile(
    ptr0,
    len0,
    ptr1,
    len1,
    ptr2,
    len2,
    ptr3,
    len3,
    ptr4,
    len4,
    ptr5,
    len5,
    ptr6,
    len6,
    ptr7,
    len7,
  );
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}

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
  specifiers,
  maybe_tags,
  maybe_exclude,
  maybe_include,
  maybe_custom_ignore_file_directive,
  maybe_custom_ignore_diagnostic_directive,
  maybe_default_jsx_factory,
  maybe_default_jsx_fragment_factory,
) {
  const ptr0 = passArrayJsValueToWasm0(specifiers, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(maybe_tags)
    ? 0
    : passArrayJsValueToWasm0(maybe_tags, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = isLikeNone(maybe_exclude)
    ? 0
    : passArrayJsValueToWasm0(maybe_exclude, wasm.__wbindgen_malloc);
  var len2 = WASM_VECTOR_LEN;
  var ptr3 = isLikeNone(maybe_include)
    ? 0
    : passArrayJsValueToWasm0(maybe_include, wasm.__wbindgen_malloc);
  var len3 = WASM_VECTOR_LEN;
  var ptr4 = isLikeNone(maybe_custom_ignore_file_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_file_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len4 = WASM_VECTOR_LEN;
  var ptr5 = isLikeNone(maybe_custom_ignore_diagnostic_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_diagnostic_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len5 = WASM_VECTOR_LEN;
  var ptr6 = isLikeNone(maybe_default_jsx_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len6 = WASM_VECTOR_LEN;
  var ptr7 = isLikeNone(maybe_default_jsx_fragment_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_fragment_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len7 = WASM_VECTOR_LEN;
  const ret = wasm.lintFiles(
    ptr0,
    len0,
    ptr1,
    len1,
    ptr2,
    len2,
    ptr3,
    len3,
    ptr4,
    len4,
    ptr5,
    len5,
    ptr6,
    len6,
    ptr7,
    len7,
  );
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}

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
  directory,
  maybe_recursive,
  maybe_exts,
  maybe_tags,
  maybe_exclude,
  maybe_include,
  maybe_custom_ignore_file_directive,
  maybe_custom_ignore_diagnostic_directive,
  maybe_default_jsx_factory,
  maybe_default_jsx_fragment_factory,
) {
  const ptr0 = passStringToWasm0(
    directory,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(maybe_exts)
    ? 0
    : passArrayJsValueToWasm0(maybe_exts, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = isLikeNone(maybe_tags)
    ? 0
    : passArrayJsValueToWasm0(maybe_tags, wasm.__wbindgen_malloc);
  var len2 = WASM_VECTOR_LEN;
  var ptr3 = isLikeNone(maybe_exclude)
    ? 0
    : passArrayJsValueToWasm0(maybe_exclude, wasm.__wbindgen_malloc);
  var len3 = WASM_VECTOR_LEN;
  var ptr4 = isLikeNone(maybe_include)
    ? 0
    : passArrayJsValueToWasm0(maybe_include, wasm.__wbindgen_malloc);
  var len4 = WASM_VECTOR_LEN;
  var ptr5 = isLikeNone(maybe_custom_ignore_file_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_file_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len5 = WASM_VECTOR_LEN;
  var ptr6 = isLikeNone(maybe_custom_ignore_diagnostic_directive)
    ? 0
    : passStringToWasm0(
      maybe_custom_ignore_diagnostic_directive,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len6 = WASM_VECTOR_LEN;
  var ptr7 = isLikeNone(maybe_default_jsx_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len7 = WASM_VECTOR_LEN;
  var ptr8 = isLikeNone(maybe_default_jsx_fragment_factory)
    ? 0
    : passStringToWasm0(
      maybe_default_jsx_fragment_factory,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
  var len8 = WASM_VECTOR_LEN;
  const ret = wasm.lintFolder(
    ptr0,
    len0,
    isLikeNone(maybe_recursive) ? 0xFFFFFF : maybe_recursive ? 1 : 0,
    ptr1,
    len1,
    ptr2,
    len2,
    ptr3,
    len3,
    ptr4,
    len4,
    ptr5,
    len5,
    ptr6,
    len6,
    ptr7,
    len7,
    ptr8,
    len8,
  );
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}

function getArrayJsValueFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  const mem = getDataViewMemory0();
  const result = [];
  for (let i = ptr; i < ptr + 4 * len; i += 4) {
    result.push(wasm.__wbindgen_export_4.get(mem.getUint32(i, true)));
  }
  wasm.__externref_drop_slice(ptr, len);
  return result;
}
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
export function getRules(maybe_tags, maybe_exclude, maybe_include) {
  var ptr0 = isLikeNone(maybe_tags)
    ? 0
    : passArrayJsValueToWasm0(maybe_tags, wasm.__wbindgen_malloc);
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(maybe_exclude)
    ? 0
    : passArrayJsValueToWasm0(maybe_exclude, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  var ptr2 = isLikeNone(maybe_include)
    ? 0
    : passArrayJsValueToWasm0(maybe_include, wasm.__wbindgen_malloc);
  var len2 = WASM_VECTOR_LEN;
  const ret = wasm.getRules(ptr0, len0, ptr1, len1, ptr2, len2);
  var v4 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v4;
}

/**
 * Get all available rule codes.
 * @returns {string[]}
 */
export function getAllRules() {
  const ret = wasm.getAllRules();
  var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v1;
}

/**
 * Get the rule codes associated with the recommended tag.
 * @returns {string[]}
 */
export function getRecommendedRules() {
  const ret = wasm.getRecommendedRules();
  var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v1;
}

/**
 * Get all of the tags associated with the given rule codes. If no rules
 * are provided, all available tags will be returned.
 * @param {string[] | null} [maybe_rules]
 * @returns {string[]}
 */
export function getTags(maybe_rules) {
  var ptr0 = isLikeNone(maybe_rules)
    ? 0
    : passArrayJsValueToWasm0(maybe_rules, wasm.__wbindgen_malloc);
  var len0 = WASM_VECTOR_LEN;
  const ret = wasm.getTags(ptr0, len0);
  var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v2;
}

/**
 * Get all available tags.
 * @returns {string[]}
 */
export function getAllTags() {
  const ret = wasm.getAllTags();
  var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v1;
}

const FsFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_fs_free(ptr >>> 0, 1));

export class Fs {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    FsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_fs_free(ptr, 0);
  }
  constructor() {
    const ret = wasm.fs_new();
    this.__wbg_ptr = ret >>> 0;
    FsFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @returns {string}
   */
  static cwd() {
    let deferred2_0;
    let deferred2_1;
    try {
      const ret = wasm.fs_cwd();
      var ptr1 = ret[0];
      var len1 = ret[1];
      if (ret[3]) {
        ptr1 = 0;
        len1 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
  /**
   * @param {string} path
   */
  static chdir(path) {
    const ptr0 = passStringToWasm0(
      path,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.fs_chdir(ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} path
   * @returns {any}
   */
  static statSync(path) {
    const ptr0 = passStringToWasm0(
      path,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.fs_statSync(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {string} path
   * @returns {any}
   */
  static readFileSync(path) {
    const ptr0 = passStringToWasm0(
      path,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.fs_readFileSync(ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {string} path
   * @returns {string}
   */
  static readTextFileSync(path) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(
        path,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.fs_readTextFileSync(ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
  /**
   * @param {string} path
   * @param {boolean} recursive
   * @returns {any}
   */
  static readdirSync(path, recursive) {
    const ptr0 = passStringToWasm0(
      path,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.fs_readdirSync(ptr0, len0, recursive);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {string} path
   * @param {any} data
   */
  static writeFileSync(path, data) {
    const ptr0 = passStringToWasm0(
      path,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.fs_writeFileSync(ptr0, len0, data);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * @param {string} path
   * @param {string} data
   */
  static writeTextFileSync(path, data) {
    const ptr0 = passStringToWasm0(
      path,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      data,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.fs_writeTextFileSync(ptr0, len0, ptr1, len1);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
}

export function __wbg_String_8f0eb39a4a4c2f66(arg0, arg1) {
  const ret = String(arg1);
  const ptr1 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}

export function __wbg_buffer_609cc3eee51ed158(arg0) {
  const ret = arg0.buffer;
  return ret;
}

export function __wbg_call_672a4d21634d4a24() {
  return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
  }, arguments);
}

export function __wbg_chdir_e2f40a3ad77dc4db() {
  return handleError(function (arg0, arg1, arg2) {
    arg0.chdir(getStringFromWasm0(arg1, arg2));
  }, arguments);
}

export function __wbg_cwd_293401050b5ff90a() {
  return handleError(function (arg0, arg1) {
    const ret = arg1.cwd();
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  }, arguments);
}

export function __wbg_done_769e5ede4b31c67b(arg0) {
  const ret = arg0.done;
  return ret;
}

export function __wbg_get_67b2ba62fc30de12() {
  return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
  }, arguments);
}

export function __wbg_get_b9b93047fe3cf45b(arg0, arg1) {
  const ret = arg0[arg1 >>> 0];
  return ret;
}

export function __wbg_get_f8ce469b25541087(arg0, arg1, arg2, arg3) {
  const ret = arg1[getStringFromWasm0(arg2, arg3)];
  var ptr1 = isLikeNone(ret)
    ? 0
    : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}

export function __wbg_getwithrefkey_1dc361bd10053bfe(arg0, arg1) {
  const ret = arg0[arg1];
  return ret;
}

export function __wbg_instanceof_ArrayBuffer_e14585432e3737fc(arg0) {
  let result;
  try {
    result = arg0 instanceof ArrayBuffer;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
}

export function __wbg_instanceof_Uint8Array_17156bcf118086a9(arg0) {
  let result;
  try {
    result = arg0 instanceof Uint8Array;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
}

export function __wbg_isArray_a1eab7e0d067391b(arg0) {
  const ret = Array.isArray(arg0);
  return ret;
}

export function __wbg_isSafeInteger_343e2beeeece1bb0(arg0) {
  const ret = Number.isSafeInteger(arg0);
  return ret;
}

export function __wbg_iterator_9a24c88df860dc65() {
  const ret = Symbol.iterator;
  return ret;
}

export function __wbg_length_a446193dc22c12f8(arg0) {
  const ret = arg0.length;
  return ret;
}

export function __wbg_length_e2d2a49132c1b256(arg0) {
  const ret = arg0.length;
  return ret;
}

export function __wbg_new_405e22f390576ce2() {
  const ret = new Object();
  return ret;
}

export function __wbg_new_78feb108b6472713() {
  const ret = new Array();
  return ret;
}

export function __wbg_new_a12002a7f91c75be(arg0) {
  const ret = new Uint8Array(arg0);
  return ret;
}

export function __wbg_new_b08a00743b8ae2f3(arg0, arg1) {
  const ret = new TypeError(getStringFromWasm0(arg0, arg1));
  return ret;
}

export function __wbg_next_25feadfc0913fea9(arg0) {
  const ret = arg0.next;
  return ret;
}

export function __wbg_next_6574e1a8a62d1055() {
  return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
  }, arguments);
}

export function __wbg_now_e3412d753ec0c3e7() {
  return handleError(function (arg0) {
    const ret = arg0.now();
    return ret;
  }, arguments);
}

export function __wbg_readFileSync_fe095de331eb53f4() {
  return handleError(function (arg0, arg1, arg2) {
    const ret = arg0.readFileSync(getStringFromWasm0(arg1, arg2));
    return ret;
  }, arguments);
}

export function __wbg_readdir_f7c665b5a2c6db6f() {
  return handleError(function (arg0, arg1, arg2) {
    const ret = read_dir(getStringFromWasm0(arg0, arg1), arg2);
    return ret;
  }, arguments);
}

export function __wbg_readfile_61a1326920a9cbaf() {
  return handleError(function (arg0, arg1) {
    const ret = read_file(getStringFromWasm0(arg0, arg1));
    return ret;
  }, arguments);
}

export function __wbg_readtextfile_7b805033771d9097() {
  return handleError(function (arg0, arg1, arg2) {
    const ret = read_text_file(getStringFromWasm0(arg1, arg2));
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  }, arguments);
}

export function __wbg_set_37837023f3d740e8(arg0, arg1, arg2) {
  arg0[arg1 >>> 0] = arg2;
}

export function __wbg_set_3f1d0b984ed272ed(arg0, arg1, arg2) {
  arg0[arg1] = arg2;
}

export function __wbg_set_65595bdd868b3009(arg0, arg1, arg2) {
  arg0.set(arg1, arg2 >>> 0);
}

export function __wbg_set_bb8cecf6a62b9f46() {
  return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(arg0, arg1, arg2);
    return ret;
  }, arguments);
}

export function __wbg_stat_4492a941acf6b92d() {
  return handleError(function (arg0, arg1) {
    const ret = stat(getStringFromWasm0(arg0, arg1));
    return ret;
  }, arguments);
}

export function __wbg_static_accessor_ENV_743d045ff86c40a9() {
  const ret = process.env;
  return ret;
}

export function __wbg_static_accessor_PERFORMANCE_18c20f7f9b7ea77b() {
  const ret = performance;
  return ret;
}

export function __wbg_static_accessor_PROCESS_a9eb134fb48364db() {
  const ret = process;
  return ret;
}

export function __wbg_static_accessor_VFS_d6e6a53324f01e1b() {
  const ret = vfs;
  return ret;
}

export function __wbg_value_cd1ffa7b1ab794f1(arg0) {
  const ret = arg0.value;
  return ret;
}

export function __wbg_writefile_45811d81e12d297e() {
  return handleError(function (arg0, arg1, arg2) {
    write_file(getStringFromWasm0(arg0, arg1), arg2);
  }, arguments);
}

export function __wbg_writetextfile_12bc5f93950b2366() {
  return handleError(function (arg0, arg1, arg2, arg3) {
    write_text_file(
      getStringFromWasm0(arg0, arg1),
      getStringFromWasm0(arg2, arg3),
    );
  }, arguments);
}

export function __wbindgen_as_number(arg0) {
  const ret = +arg0;
  return ret;
}

export function __wbindgen_bigint_from_u64(arg0) {
  const ret = BigInt.asUintN(64, arg0);
  return ret;
}

export function __wbindgen_bigint_get_as_i64(arg0, arg1) {
  const v = arg1;
  const ret = typeof v === "bigint" ? v : undefined;
  getDataViewMemory0().setBigInt64(
    arg0 + 8 * 1,
    isLikeNone(ret) ? BigInt(0) : ret,
    true,
  );
  getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}

export function __wbindgen_boolean_get(arg0) {
  const v = arg0;
  const ret = typeof v === "boolean" ? (v ? 1 : 0) : 2;
  return ret;
}

export function __wbindgen_debug_string(arg0, arg1) {
  const ret = debugString(arg1);
  const ptr1 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}

export function __wbindgen_error_new(arg0, arg1) {
  const ret = new Error(getStringFromWasm0(arg0, arg1));
  return ret;
}

export function __wbindgen_in(arg0, arg1) {
  const ret = arg0 in arg1;
  return ret;
}

export function __wbindgen_init_externref_table() {
  const table = wasm.__wbindgen_export_4;
  const offset = table.grow(4);
  table.set(0, undefined);
  table.set(offset + 0, undefined);
  table.set(offset + 1, null);
  table.set(offset + 2, true);
  table.set(offset + 3, false);
}

export function __wbindgen_is_bigint(arg0) {
  const ret = typeof arg0 === "bigint";
  return ret;
}

export function __wbindgen_is_function(arg0) {
  const ret = typeof arg0 === "function";
  return ret;
}

export function __wbindgen_is_object(arg0) {
  const val = arg0;
  const ret = typeof val === "object" && val !== null;
  return ret;
}

export function __wbindgen_is_undefined(arg0) {
  const ret = arg0 === undefined;
  return ret;
}

export function __wbindgen_jsval_eq(arg0, arg1) {
  const ret = arg0 === arg1;
  return ret;
}

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
  const ret = arg0 == arg1;
  return ret;
}

export function __wbindgen_memory() {
  const ret = wasm.memory;
  return ret;
}

export function __wbindgen_number_get(arg0, arg1) {
  const obj = arg1;
  const ret = typeof obj === "number" ? obj : undefined;
  getDataViewMemory0().setFloat64(
    arg0 + 8 * 1,
    isLikeNone(ret) ? 0 : ret,
    true,
  );
  getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}

export function __wbindgen_number_new(arg0) {
  const ret = arg0;
  return ret;
}

export function __wbindgen_string_get(arg0, arg1) {
  const obj = arg1;
  const ret = typeof obj === "string" ? obj : undefined;
  var ptr1 = isLikeNone(ret)
    ? 0
    : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}

export function __wbindgen_string_new(arg0, arg1) {
  const ret = getStringFromWasm0(arg0, arg1);
  return ret;
}

export function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}
