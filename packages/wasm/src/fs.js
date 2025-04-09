// deno-lint-ignore-file no-var

/**
 * This module provides a set of isomorphic functions and classes for working
 * with the file system, environment variables, and basic process tasks in a
 * platform-agnostic way. When the runtime environment doesn't support one of
 * these features, a polyfilled / stubbed implementation is used instead.
 *
 * For example, the FS functions give preference to the `node:fs` module if it
 * is available (e.g. in Deno, Node.js, and Bun), but when run in a browser (or
 * anywhere else where `node:fs` is not available), a custom virtual file
 * system (VFS) implementation is used instead.
 *
 * This VFS is backed by a localStorage-based storage system, which allows the
 * WebAssembly module to interact with a file-system API regardless of the
 * environment it is running in.
 *
 * If the Web Storage API is also unavailable in the current environment
 * (seriously _what_ environment are you running this in?!), then an in-memory
 * polyfill of it is used instead. So, theoretically, this should "just work".
 *
 * @module fs
 */

/** @type {typeof globalThis} */
var _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  // deno-lint-ignore no-node-globals
  if (typeof global !== "undefined") return global; // node
  if (typeof window !== "undefined") return window; // browsers, deno v1
  if (typeof self !== "undefined") return self; // web workers
  if (typeof root !== "undefined") return root; // old browsers (which ones?)
  if (typeof this !== "undefined") return this; // non-strict mode (cjs)
  return (0, eval)("this");
})();

var Set = _global.Set;
var Map = _global.Map;
var WeakMap = _global.WeakMap;
var Proxy = _global.Proxy;
var Symbol = _global.Symbol;
var Object = _global.Object;
var ArrayBuffer = _global.ArrayBuffer;
var Uint8Array = _global.Uint8Array;
var Error = _global.Error;
var Date = _global.Date;
var JSON = _global.JSON;
var console = _global.console;
var Reflect = _global.Reflect;
var ReflectGet = Reflect.get;
var ReflectSet = Reflect.set;
var ReflectHas = Reflect.has;
var ReflectOwnKeys = Reflect.ownKeys;
var ReflectGetOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;

var hasConsole = typeof console === "object" &&
  typeof console?.log === "function";
var isNode = typeof _global.process !== "undefined" &&
  typeof _global.process.versions !== "undefined" &&
  typeof _global.process.versions.node !== "undefined";
var isDeno = typeof _global.Deno !== "undefined" &&
  typeof _global.Deno.version !== "undefined" &&
  typeof _global.Deno.version.deno !== "undefined";

// #region Web Storage Polyfill
const STORAGE = new WeakMap();

function getStore(storage, create) {
  let store = STORAGE.get(storage);
  if (!store && create) STORAGE.set(storage, store = new Map());
  return store;
}

const _useSessionStorage = Symbol("useSessionStorage");
/**
 * Web Storage API polyfill that provides a localStorage and sessionStorage
 * implementation, backed by an in-memory storage object.
 *
 * @remarks
 * This is used to create a localStorage-backed virtual file system, as a
 * compatibility fallback for the edge cases where the runtime environment does
 * not support the Web Storage API.
 */
export class Storage {
  constructor() {
    if (
      _global.sessionStorage &&
      !(_global.sessionStorage instanceof Storage)
    ) {
      if (arguments[0] === _useSessionStorage) {
        return _global.sessionStorage;
      }
    } else if (
      _global.localStorage &&
      !(_global.localStorage instanceof Storage)
    ) {
      return _global.localStorage;
    }
    // deno-lint-ignore no-this-alias
    const self = this;
    const isInternal = (k) =>
      k === "length" || k === "getItem" || k === "setItem" ||
      k === "removeItem" || k === "clear" || k === "key" ||
      k === Symbol.toStringTag;
    return new Proxy(this, {
      get: (t, k) => {
        if (isInternal(k)) {
          if (k === "length") return self.length;
          if (k === Symbol.toStringTag) return self[Symbol.toStringTag];
          const v = t[k];
          if (typeof v === "function") {
            return Object.defineProperty(v.bind(t), "name", {
              value: k,
            });
          }
          return v;
        }
        if (typeof k === "string") return self.getItem(k) ?? Reflect.get(t, k);
        return Reflect.get(t, k);
      },
      has: (t, k) => {
        return isInternal(k) || Reflect.has(t, k) ||
          typeof k === "string" && t.getItem(k) !== null;
      },
      set: (t, k, value) => {
        if (isInternal(k)) return false;
        if (typeof k === "string") {
          return t.setItem(k, String(value ?? "")), true;
        }
        return Reflect.set(t, k, value);
      },
      ownKeys: (t) => {
        const keys = new Set(Reflect.ownKeys(t));
        for (const [key] of getStore(self, false) ?? []) keys.add(key);
        keys.add("length");
        return [
          ...keys,
        ];
      },
      getOwnPropertyDescriptor: (t, k) => {
        let d = Reflect.getOwnPropertyDescriptor(t, k);
        if (!d && typeof k === "string") {
          let value = null;
          if (k === "length") value = self.length;
          value ??= self.getItem(k);
          if (value === null) return d;
          d = {
            value,
            writable: k !== "length",
            configurable: true,
            enumerable: true,
          };
        } else if (d) {
          d = {
            ...d,
            configurable: true,
          };
        }
        return d;
      },
      defineProperty: (t, k, d) => {
        if (isInternal(k)) return false;
        if (typeof k === "string") {
          if (d && "value" in d) {
            return t.setItem(k, String(d.value ?? "")), true;
          }
        }
        return Reflect.defineProperty(t, k, d);
      },
      deleteProperty: (t, k) => {
        if (isInternal(k)) return false;
        if (typeof k === "string") {
          return t.removeItem(k), true;
        }
        return Reflect.deleteProperty(t, k);
      },
    });
  }
  get length() {
    return getStore(this, true).size;
  }
  getItem(key) {
    return getStore(this, true).get(key) ?? null;
  }
  setItem(key, value) {
    getStore(this, true).set(key, value);
  }
  removeItem(key) {
    getStore(this, true).delete(key);
  }
  clear() {
    getStore(this, true).clear();
  }
  key(n) {
    if ((n = +n) >= 0 && n < this.length) {
      for (const [key] of getStore(this, true)) {
        if (n-- === 0) return key;
      }
    }
    return null;
  }
}

export const localStorage = new Storage();
export const sessionStorage = new Storage(_useSessionStorage);

(function installPolyfill() {
  try {
    _global.localStorage.setItem("__test__", "test");
    _global.localStorage.removeItem("__test__");
    return {
      status: "skipped",
    };
  } catch (_) {
    try {
      Object.defineProperty(_global, "localStorage", {
        value: localStorage,
        configurable: true,
        enumerable: false,
        writable: true,
      });
      Object.defineProperty(_global, "sessionStorage", {
        value: sessionStorage,
        configurable: true,
        enumerable: false,
        writable: true,
      });
      Object.defineProperty(_global, "Storage", {
        value: Storage,
        configurable: true,
        enumerable: false,
        writable: true,
      });
      return {
        status: "success",
        localStorage,
        sessionStorage,
      };
    } catch (reason) {
      return {
        status: "failure",
        reason,
      };
    }
  }
})();
// #endregion Web Storage Polyfill

// #region Process Polyfill

// process.env polyfill that defers to the real process.env or Deno.env
// if either of those are available.
/**
 * @type {typeof import("node:process").default.env}
 */
export class ProcessEnv {
  constructor(env) {
    if (
      isNode &&
      typeof _global.process.env === "object" &&
      typeof _global.process.env !== null
    ) {
      return _global.process.env;
    } else if (
      isDeno &&
      typeof _global.Deno.env !== "undefined" &&
      typeof _global.Deno.env.toObject === "function"
    ) {
      env = { ...env ?? {}, ..._global.Deno.env.toObject() };
    }

    return new Proxy(env, {
      get: (t, k) => {
        if (typeof k === "string") {
          const key = k.toUpperCase();
          return t[key] ?? t[k];
        }
        return ReflectGet(t, k);
      },
      has: (t, k) => {
        if (typeof k === "string") {
          const key = k.toUpperCase();
          return key in t || k in t;
        }
        return ReflectHas(t, k);
      },
      set: (t, k, v) => {
        if (typeof k === "string") {
          const key = k.toUpperCase();
          t[key] = t[k] = v;
          return true;
        }
        return ReflectSet(t, k, v);
      },
      ownKeys: (t) => {
        const keys = new Set(ReflectOwnKeys(t));
        for (const key in t) keys.add(key.toUpperCase());
        return [...keys];
      },
      getOwnPropertyDescriptor: (t, k) => {
        let d = ReflectGetOwnPropertyDescriptor(t, k);
        if (typeof k === "string") {
          const key = k.toUpperCase();
          d ||= ReflectGetOwnPropertyDescriptor(t, key);
        }
        if (d && "value" in d) {
          d.configurable = d.enumerable = d.writable = true;
        }
        return d;
      },
    });
  }
}

// process.stdout / process.stderr polyfill that uses console.log and
// console.error under the hood, if available.
/**
 * @type {typeof _global.process.stdin}
 */
export class ProcessStdio {
  #enc = (data) => {
    if (ArrayBuffer.isView(data)) {
      const { buffer, byteLength, byteOffset } = data;
      return new Uint8Array(buffer, byteOffset, byteLength);
      // data = buf.reduce((a, b) => a + String.fromCharCode(b), "");
    } else if (typeof data === "string") {
      return Uint8Array.from([...data].map((c) => c.charCodeAt(0)));
    } else if (Array.isArray(data)) {
      return Uint8Array.from(data);
    }
  };
  #dec = (b) => this.#enc(b).reduce((a, b) => a + String.fromCharCode(b), "");

  /**
   * Stdio file descriptor number:
   * - `0`: stdin
   * - `1`: stdout
   * - `2`: stderr
   *
   * @default {1}
   */
  fd = 1;
  bytesWritten = 0;
  bytesRead = 0;

  constructor(fd) {
    if (typeof fd === "number") this.fd = fd;
    // if the global process object is available, always defer to that.
    if (isNode) {
      if (this.fd === 0) return _global.process.stdin;
      if (this.fd === 1) return _global.process.stdout;
      if (this.fd === 2) return _global.process.stderr;
    }
  }

  /**
   * @param {string | Uint8Array} data
   * @returns {boolean}
   */
  write = (data) => {
    const buf = this.#enc(data);
    if (isDeno) {
      let len = 0;
      if (this.fd === 1) {
        len = _global.Deno.stdout.writeSync(buf);
      } else {
        len = _global.Deno.stderr.writeSync(buf);
      }
      this.bytesWritten += len;
      return len === buf.length;
    } else if (hasConsole) {
      data = this.#dec(buf);
      if (this.fd === 1) {
        console.log(data);
      } else {
        console.error(data);
      }
      this.bytesWritten += buf.length;
      return true;
    }
    return false;
  };

  /**
   * @param {size} number
   * @returns {Uint8Array | null}
   */
  read = (size) => {
    const p = new Uint8Array(size);
    let len = null;
    if (isDeno && this.fd === 0) {
      len = _global.Deno.stdin.readSync(p);
    } else {
      return null;
    }
    if (len === null) return null;
    this.bytesRead += len;
    return p;
  };
}

/**
 * @type {typeof _global.process}
 */
export class Process {
  #cwd_key = "__node:process_cwd__";
  #exit_code = 0;

  env = new ProcessEnv(_global.process?.env);
  stdin = new ProcessStdio(0);
  stdout = new ProcessStdio(1);
  stderr = new ProcessStdio(2);
  argv = _global.process?.argv ?? [];
  title = _global.process?.title ?? "";
  pid = _global.process?.pid ?? 0;
  platform = _global.process?.platform ?? "unknown";
  arch = _global.process?.arch ?? "wasm32";
  version = _global.process?.version ?? "";
  versions = _global.process?.versions ?? {};
  release = _global.process?.release ?? {};

  constructor() {
    if ((isNode || isDeno) && typeof _global.process === "object") {
      return _global.process;
    }
    if (isDeno) {
      this.arch = _global.Deno.build.arch;
      this.platform = _global.Deno.build.os;
      this.version = _global.Deno.version.deno;
      this.versions = { ..._global.Deno.version };
      this.release = { ..._global.Deno.version };
      this.pid = _global.Deno.pid;
      this.ppid = _global.Deno.ppid;
      this.uid = _global.Deno.uid;
      this.gid = _global.Deno.gid;
      this.umask = (...args) => _global.Deno.umask(...args);
      this.cwd = () => _global.Deno.cwd();
    }
  }

  get exitCode() {
    return this.#exit_code;
  }

  set exitCode(code) {
    code = +code >>> 0;
    if (code > 255 || code < 0) throw new RangeError();
    this.#exit_code = code;
  }

  umask = (...args) =>
    _global.process?.umask?.(...args) ?? (
      args.length ? void 0 : 0o222
    );

  cwd = () => {
    if (isNode) return _global.process.cwd();
    if (isDeno) return _global.Deno.cwd();
    const s = _global.sessionStorage;
    let d = s.getItem(this.#cwd_key);
    if (!d) s.setItem(this.#cwd_key, d = "/");
    return d;
  };

  chdir = (dir) => {
    if (isNode) return _global.process.chdir(dir);
    if (isDeno) return _global.Deno.chdir(dir);
    const s = _global.sessionStorage;
    const sep = this.platform === "win32" ? "\\" : "/";
    let d = this.cwd();
    dir = dir.toString();
    if (dir.startsWith("/") || dir.startsWith("\\")) {
      d = dir;
    } else {
      d = d + sep + dir;
    }
    // normalize the path a bit
    d = d.replace(/\\+|\/+/g, "/");
    d = d.replace(/^\.\/|\/+$|\/+(?=\.)|\/+(?=\.\.)|(?<=\/)\.?\/+/g, "");
    d = d.replace(/\/+/g, sep);
    // resolve relative paths, e.g. a/../foo/./bar -> /a/foo/bar
    const parts = d.split(/\\|\//);
    const stack = [];
    for (const part of parts) {
      if (part === "..") {
        stack.pop();
      } else if (part !== "." && part !== "") {
        stack.push(part);
      }
    }
    d = sep + stack.join(sep);
    s.setItem(this.#cwd_key, d);
  };

  exit(code = process.exitCode) {
    if (isNode && typeof _global.process.exit === "function") {
      _global.process.exit(code);
    } else if (isDeno && typeof _global.Deno.exit === "function") {
      _global.Deno.exit(code);
    } else {
      throw new Error(`Exit with code ${code}`);
    }
  }
}

export const process = new Process();

// #endregion Process Polyfill

// #region Virtual File System (VFS)
/**
 * Virtual File System (VFS) class that provides a set of platform-agnostic
 * file system functions backed by a localStorage-based storage implementation.
 *
 * If the Web Storage API is not supported in the current environment, it is
 * polyfilled with an in-memory storage implementation (see `storage.js`).
 *
 * The API surface of this VFS is designed to be compatible with the `node:fs`
 * module (not in entirety, obviously). This allows the WebAssembly module to
 * interact with a file-system API regardless of the environment it is running
 * in. If `node:fs` is available, it is always given preference over the VFS.
 * See the section below this class for that implementation.
 */
export class VFS {
  #storage = _global.localStorage;
  #prefix = "";
  #sep = "/";

  constructor(options = {}) {
    if (options.prefix) this.#prefix = options.prefix;
    if (options.sep) this.#sep = options.sep;
    // Initialize inode counter if not present
    const counterKey = this.#prefix + "inode_counter";
    if (!this.#storage.getItem(counterKey)) {
      this.#storage.setItem(counterKey, "1");
    }
  }

  // ---------- Inode Table Helpers ----------

  #getInodeKey(id) {
    return this.#prefix + "inode:" + id;
  }

  #getInode(id) {
    return this.#getItem(this.#getInodeKey(id));
  }

  #setInode(id, inodeRecord) {
    const key = this.#getInodeKey(id);
    this.#storage.setItem(key, JSON.stringify(inodeRecord));
  }

  #deleteInode(id) {
    const key = this.#getInodeKey(id);
    this.#storage.removeItem(key);
  }

  #getNextInode() {
    const counterKey = this.#prefix + "inode_counter";
    let counter = Number(this.#storage.getItem(counterKey)) || 1;
    const next = counter;
    counter++;
    this.#storage.setItem(counterKey, counter.toString());
    return next;
  }

  // ---------- Path and Record Helpers ----------

  #normalizePath(path) {
    return path.startsWith(this.#sep) ? path : this.#sep + path;
  }

  #getKey(path) {
    return this.#prefix + this.#normalizePath(path);
  }

  #getItem(key) {
    const item = this.#storage.getItem(key);
    if (item === null) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  #setItem(key, value) {
    this.#storage.setItem(key, JSON.stringify(value));
  }

  #removeItem(key) {
    this.#storage.removeItem(key);
  }

  // Resolves symlinks unless lstat is true.
  #resolvePath(path, { lstat = false } = {}) {
    let currentPath = this.#normalizePath(path);
    let record = this.#getItem(this.#getKey(currentPath));
    if (!record) {
      throw this.#error(
        "ENOENT",
        `ENOENT: no such file or directory, '${path}'`,
      );
    }
    if (!lstat) {
      const seen = new Set();
      while (record.type === "symlink") {
        if (seen.has(currentPath)) {
          throw this.#error(
            "ELOOP",
            `ELOOP: too many symbolic links, '${path}'`,
          );
        }
        seen.add(currentPath);
        currentPath = this.#normalizePath(record.target);
        record = this.#getItem(this.#getKey(currentPath));
        if (!record) {
          throw this.#error(
            "ENOENT",
            `ENOENT: no such file or directory, '${currentPath}'`,
          );
        }
      }
    }
    return { record, path: currentPath };
  }

  #dirname(path) {
    const norm = this.#normalizePath(path);
    const parts = norm.split(this.#sep);
    parts.pop();
    const dir = parts.join(this.#sep);
    return dir === "" ? this.#sep : dir;
  }

  #error(code, message, options) {
    const err = new Error(message, options);
    err.code = code;
    err.name = options?.name ?? "Error";
    Error.captureStackTrace?.(err, this.#error);
    err.stack; // Ensure stack is generated
    return err;
  }

  // ---------- File System API ----------

  readFile(path, options, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.readFileSync(path, options);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  readFileSync(path, options) {
    if (typeof options === "string") options = { encoding: options };
    else if (!options) options = { encoding: "utf8" };
    const { record } = this.#resolvePath(path);
    if (record.type !== "file") {
      const err = new Error(
        `EISDIR: illegal operation on a directory, read '${path}'`,
      );
      err.code = record.type === "dir" ? "EISDIR" : "EINVAL";
      throw err;
    }
    if (typeof record.inode !== "number") {
      const err = new Error(`Invalid file record: missing inode, '${path}'`);
      throw err;
    }
    const inode = this.#getInode(record.inode);
    if (!inode) {
      throw this.#error("ENOENT", `ENOENT: inode not found for '${path}'`);
    }
    return inode.content;
  }

  writeFile(path, data, options, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.writeFileSync(path, data, options);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  writeFileSync(path, data, options) {
    if (typeof options === "string") options = { encoding: options };
    else if (!options) options = { encoding: "utf8" };

    const parent = this.#dirname(path);
    if (parent !== "" && parent !== this.#sep) {
      const parentRecord = this.#getItem(this.#getKey(parent));
      if (!parentRecord || parentRecord.type !== "dir") {
        throw this.#error(
          "ENOENT",
          `ENOENT: no such directory, open '${path}'`,
        );
      }
    }
    const content = data.toString();
    const now = Date.now();
    let fileRecord;
    try {
      const res = this.#resolvePath(path);
      fileRecord = res.record;
    } catch {
      fileRecord = null;
    }
    if (fileRecord) {
      if (fileRecord.type !== "file") {
        const err = new Error(
          `EISDIR: illegal operation, open '${path}'`,
        );
        err.code = fileRecord.type === "dir" ? "EISDIR" : "EINVAL";
        throw err;
      }
      const inode = this.#getInode(fileRecord.inode);
      if (!inode) {
        throw this.#error("ENOENT", `ENOENT: inode not found for '${path}'`);
      }
      inode.content = content;
      inode.stats.size = content.length;
      inode.stats.mtime = now;
      this.#setInode(fileRecord.inode, inode);
    } else {
      const inodeId = this.#getNextInode();
      const atime = new Date(), mtime = new Date(), ctime = new Date();
      const birthtime = new Date();
      const atimeMs = +atime, mtimeMs = +mtime, ctimeMs = +ctime;
      const birthtimeMs = +birthtime;
      const inodeRecord = {
        content,
        stats: {
          size: content.length,
          mode: 0o644,
          uid: 0,
          gid: 0,
          atime,
          mtime,
          ctime,
          birthtime,
          atimeMs,
          mtimeMs,
          ctimeMs,
          birthtimeMs,
          nlink: 1,
        },
      };
      this.#setInode(inodeId, inodeRecord);
      const newRecord = { type: "file", inode: inodeId };
      this.#setItem(this.#getKey(path), newRecord);
    }
  }

  appendFile(path, data, options, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.appendFileSync(path, data, options);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  appendFileSync(path, data, options) {
    if (typeof options === "string") options = { encoding: options };
    else if (!options) options = { encoding: "utf8" };

    const contentToAppend = data.toString();
    const now = Date.now();
    try {
      const { record } = this.#resolvePath(path);
      if (record.type !== "file") {
        const err = new Error(
          `EISDIR: illegal operation, append '${path}'`,
        );
        err.code = record.type === "dir" ? "EISDIR" : "EINVAL";
        throw err;
      }
      const inode = this.#getInode(record.inode);
      inode.content += contentToAppend;
      inode.stats.size = inode.content.length;
      inode.stats.mtime = now;
      this.#setInode(record.inode, inode);
    } catch {
      this.writeFileSync(path, data, options);
    }
  }

  exists(path, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.existsSync(path);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  existsSync(path) {
    const key = this.#getKey(path);
    return !!this.#getItem(key);
  }

  mkdir(path, options, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.mkdirSync(path, options);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  mkdirSync(path, options) {
    if (!options) options = {};
    const key = this.#getKey(path);
    if (this.#getItem(key)) {
      throw this.#error(
        "EEXIST",
        `EEXIST: file already exists, mkdir '${path}'`,
      );
    }
    const recursive = options.recursive === true;
    const parent = this.#dirname(path);
    if (recursive && parent && parent !== this.#sep) {
      if (!this.existsSync(parent)) this.mkdirSync(parent, options);
    } else if (parent && parent !== this.#sep) {
      const parentRecord = this.#getItem(this.#getKey(parent));
      if (!parentRecord || parentRecord.type !== "dir") {
        throw this.#error(
          "ENOENT",
          `ENOENT: no such directory, mkdir '${path}'`,
        );
      }
    }
    const now = Date.now();
    const dirRecord = {
      type: "dir",
      stats: {
        mode: 0o755,
        uid: 0,
        gid: 0,
        atime: now,
        mtime: now,
        ctime: now,
        birthtime: now,
      },
    };
    this.#setItem(key, dirRecord);
  }

  readdir(path, options, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.readdirSync(path, options);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  readdirSync(path, options) {
    if (typeof options === "string") options = { encoding: options };
    else if (!options) options = {};
    const key = this.#getKey(path), dirRecord = this.#getItem(key);
    if (!dirRecord) {
      throw this.#error(
        "ENOENT",
        `ENOENT: no such directory, scandir '${path}'`,
      );
    }
    if (dirRecord.type !== "dir") {
      throw this.#error(
        "ENOTDIR",
        `ENOTDIR: not a directory, scandir '${path}'`,
      );
    }
    const entries = [];
    const prefix = this.#normalizePath(path);
    const len = this.#storage.length;
    for (let i = 0; i < len; i++) {
      const storedKey = this.#storage.key(i);
      if (
        storedKey &&
        storedKey.startsWith(this.#prefix + prefix + this.#sep)
      ) {
        const relPath = storedKey.slice(
          (this.#prefix + prefix + this.#sep).length,
        );
        const [entry] = relPath.split(this.#sep);
        if (!entries.includes(entry)) entries.push(entry);
      }
    }
    return entries;
  }

  stat(path, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.statSync(path);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  statSync(path) {
    const { record } = this.#resolvePath(path);
    if (record.type === "file") {
      const inode = this.#getInode(record.inode);
      if (!inode) {
        throw this.#error("ENOENT", `ENOENT: inode not found for '${path}'`);
      }
      return Object.assign({}, inode.stats, {
        isFile: () => true,
        isDirectory: () => false,
        isSymbolicLink: () => false,
      });
    } else if (record.type === "dir") {
      return Object.assign({}, record.stats, {
        isFile: () => false,
        isDirectory: () => true,
        isSymbolicLink: () => false,
      });
    } else if (record.type === "symlink") {
      return this.statSync(record.target);
    } else {
      throw this.#error("EINVAL", `EINVAL: unknown file type for '${path}'`);
    }
  }

  lstat(path, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.lstatSync(path);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  lstatSync(path) {
    const key = this.#getKey(path);
    const record = this.#getItem(key);
    if (!record) {
      throw this.#error(
        "ENOENT",
        `ENOENT: no such file or directory, '${path}'`,
      );
    }
    if (record.type === "file") {
      const inode = this.#getInode(record.inode);
      if (!inode) {
        throw this.#error("ENOENT", `ENOENT: inode not found for '${path}'`);
      }
      return Object.assign({}, inode.stats, {
        isFile: () => true,
        isDirectory: () => false,
        isSymbolicLink: () => false,
      });
    } else if (record.type === "dir") {
      return Object.assign({}, record.stats, {
        isFile: () => false,
        isDirectory: () => true,
        isSymbolicLink: () => false,
      });
    } else if (record.type === "symlink") {
      return Object.assign({}, record.stats, {
        isFile: () => false,
        isDirectory: () => false,
        isSymbolicLink: () => true,
      });
    } else {
      throw this.#error("EINVAL", `EINVAL: unknown file type for '${path}'`);
    }
  }

  unlink(path, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.unlinkSync(path);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  unlinkSync(path) {
    const key = this.#getKey(path);
    const record = this.#getItem(key);
    if (!record) {
      throw this.#error(
        "ENOENT",
        `ENOENT: no such file or directory, unlink '${path}'`,
      );
    }
    if (record.type === "dir") {
      throw this.#error(
        "EPERM",
        `EPERM: operation not permitted, unlink '${path}'`,
      );
    }
    if (record.type === "file") {
      const inode = this.#getInode(record.inode);
      inode.stats.nlink--;
      if (inode.stats.nlink <= 0) {
        this.#deleteInode(record.inode);
      } else {
        this.#setInode(record.inode, inode);
      }
    }
    this.#removeItem(key);
  }

  rmdir(path, options, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.rmdirSync(path, options);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  rmdirSync(path, options) {
    if (!options) options = {};
    const key = this.#getKey(path);
    const record = this.#getItem(key);
    if (!record) {
      throw this.#error("ENOENT", `ENOENT: no such directory, rmdir '${path}'`);
    }
    if (record.type !== "dir") {
      throw this.#error("ENOTDIR", `ENOTDIR: not a directory, rmdir '${path}'`);
    }
    const contents = this.readdirSync(path);
    if (contents.length > 0 && !options.recursive) {
      throw this.#error(
        "ENOTEMPTY",
        `ENOTEMPTY: directory not empty, rmdir '${path}'`,
      );
    }
    if (options.recursive) {
      for (const entry of contents) {
        const childPath = path + this.#sep + entry;
        const childRecord = this.#getItem(this.#getKey(childPath));
        if (childRecord) {
          if (childRecord.type === "dir") this.rmdirSync(childPath, options);
          else this.unlinkSync(childPath);
        }
      }
    }
    this.#removeItem(key);
  }

  rename(oldPath, newPath, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.renameSync(oldPath, newPath);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  renameSync(oldPath, newPath) {
    const oldKey = this.#getKey(oldPath);
    const newKey = this.#getKey(newPath);
    const record = this.#getItem(oldKey);
    if (!record) {
      throw this.#error(
        "ENOENT",
        `ENOENT: no such file or directory, rename '${oldPath}' -> '${newPath}'`,
      );
    }
    if (this.existsSync(newPath)) {
      const newRecord = this.#getItem(newKey);
      if (newRecord.type === "file") {
        const inode = this.#getInode(newRecord.inode);
        inode.stats.nlink--;
        if (inode.stats.nlink <= 0) {
          this.#deleteInode(newRecord.inode);
        } else {
          this.#setInode(newRecord.inode, inode);
        }
      }
      this.#removeItem(newKey);
    }
    this.#setItem(newKey, record);
    this.#removeItem(oldKey);
    if (record.type === "dir") {
      const oldPrefix = this.#normalizePath(oldPath) + this.#sep;
      const newPrefix = this.#normalizePath(newPath) + this.#sep;
      const keysToRename = [];
      const len = this.#storage.length;
      for (let i = 0; i < len; i++) {
        const key = this.#storage.key(i);
        if (key && key.startsWith(this.#prefix + oldPrefix)) {
          keysToRename.push(key);
        }
      }
      for (const childKey of keysToRename) {
        const childRecord = this.#getItem(childKey);
        const relPath = childKey.slice((this.#prefix + oldPrefix).length);
        const newChildKey = this.#prefix + newPrefix + relPath;
        this.#setItem(newChildKey, childRecord);
        this.#removeItem(childKey);
      }
    }
  }

  // ---------- Link and Symlink API ----------

  symlink(target, path, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.symlinkSync(target, path);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  symlinkSync(target, path) {
    if (this.existsSync(path)) {
      throw this.#error("EEXIST", `EEXIST: file exists, symlink '${path}'`);
    }
    const now = Date.now();
    const symlinkRecord = {
      type: "symlink",
      target: this.#normalizePath(target),
      stats: {
        mode: 0o777,
        uid: 0,
        gid: 0,
        atime: now,
        mtime: now,
        ctime: now,
        birthtime: now,
      },
    };
    this.#setItem(this.#getKey(path), symlinkRecord);
  }

  link(existingPath, newPath, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.linkSync(existingPath, newPath);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  linkSync(existingPath, newPath) {
    const { record } = this.#resolvePath(existingPath);
    if (record.type !== "file") {
      throw this.#error(
        "EPERM",
        `EPERM: hard link not permitted for non-file, '${existingPath}'`,
      );
    }
    if (this.existsSync(newPath)) {
      throw this.#error("EEXIST", `EEXIST: file exists, link '${newPath}'`);
    }
    const inode = this.#getInode(record.inode);
    inode.stats.nlink++;
    this.#setInode(record.inode, inode);
    const newRecord = { type: "file", inode: record.inode };
    this.#setItem(this.#getKey(newPath), newRecord);
  }

  // ---------- Symbolic Link API ----------

  readlink(path, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.readlinkSync(path);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  readlinkSync(path) {
    const { record } = this.#resolvePath(path);
    if (record.type !== "symlink") {
      throw this.#error("EINVAL", `EINVAL: not a symlink, readlink '${path}'`);
    }
    return record.target;
  }

  realpath(path, options, callback) {
    if (typeof options === "function") {
      [callback, options] = [options, {}];
    }
    return new Promise((resolve, reject) => {
      try {
        const res = this.realpathSync(path, options);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  realpathSync(path, options) {
    const { record } = this.#resolvePath(path, { lstat: true });
    if (record.type === "symlink") {
      return this.realpathSync(record.target, options);
    }
    if (options?.canonicalize) {
      return path
        .replace(/[/\\]+/g, "/")
        .replace(/\/$/, "")
        .replace(/(\/|^)([^/]+)\/\.\.(\/|$)/, "$1$3")
        .replace(/\/+|(?:\/\.)+\/?/g, "/")
        .replace(/^$/, "/")
        .replace(/\/+/g, this.#sep);
    }
    return path;
  }
  // ---------- Metadata Modification ----------

  chown(path, uid, gid, callback) {
    if (typeof gid === "function") {
      [callback, gid] = [gid, undefined];
    }
    return new Promise((resolve, reject) => {
      try {
        const res = this.chownSync(path, uid, gid);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  chownSync(path, uid, gid) {
    gid ??= uid ??= 0;
    const now = Date.now();
    const { record } = this.#resolvePath(path);
    if (record.type === "file") {
      const inode = this.#getInode(record.inode);
      inode.stats.uid = uid;
      inode.stats.gid = gid;
      inode.stats.ctime = now;
      this.#setInode(record.inode, inode);
    } else if (record.type === "dir") {
      record.stats.uid = uid;
      record.stats.gid = gid;
      record.stats.ctime = now;
      this.#setItem(this.#getKey(path), record);
    } else if (record.type === "symlink") {
      // Follow symlink
      this.chownSync(record.target, uid, gid);
    }
  }

  chmod(path, mode, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.chmodSync(path, mode);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  chmodSync(path, mode) {
    const now = Date.now();
    const { record } = this.#resolvePath(path);
    if (record.type === "file") {
      const inode = this.#getInode(record.inode);
      inode.stats.mode = mode;
      inode.stats.ctime = now;
      this.#setInode(record.inode, inode);
    } else if (record.type === "dir") {
      record.stats.mode = mode;
      record.stats.ctime = now;
      this.#setItem(this.#getKey(path), record);
    } else if (record.type === "symlink") {
      this.chmodSync(record.target, mode);
    }
  }

  utimes(path, atime, mtime, callback) {
    return new Promise((resolve, reject) => {
      try {
        const res = this.utimesSync(path, atime, mtime);
        callback?.(null, res);
        resolve(res);
      } catch (err) {
        callback?.(err);
        reject(err);
      }
    });
  }

  utimesSync(path, atime, mtime) {
    const now = Date.now();
    const { record } = this.#resolvePath(path);
    if (record.type === "file") {
      const inode = this.#getInode(record.inode);
      inode.stats.atime = new Date(atime).getTime();
      inode.stats.mtime = new Date(mtime).getTime();
      inode.stats.ctime = now;
      this.#setInode(record.inode, inode);
    } else if (record.type === "dir") {
      record.stats.atime = new Date(atime).getTime();
      record.stats.mtime = new Date(mtime).getTime();
      record.stats.ctime = now;
      this.#setItem(this.#getKey(path), record);
    } else if (record.type === "symlink") {
      this.utimesSync(record.target, atime, mtime);
    }
  }
}

// #endregion Virtual File System (VFS)

// #regiom File System API
// ---------- Node.js fs Module Compatibility ----------

/** @type {typeof import("node:fs")} */
export var fs = await (async () => {
  try {
    // always defer to the `node:fs` module if it is available
    return await import("node:fs");
  } catch {
    // otherwise use our localStorage-backed (or in-memory polyfilled) VFS!
    return new VFS();
  }
})();

export var write_file = fs.writeFileSync.bind(fs);
export var read_file = fs.readFileSync.bind(fs);
export var rename = fs.renameSync.bind(fs);
export var exists = fs.existsSync.bind(fs);
export var utimes = fs.utimesSync.bind(fs);
export var chmod = fs.chmodSync.bind(fs);
export var mkdir = fs.mkdirSync.bind(fs);
export var rmdir = fs.rmdirSync.bind(fs);
export var link = fs.linkSync.bind(fs);
export var symlink = fs.symlinkSync.bind(fs);
export var unlink = fs.unlinkSync.bind(fs);

export function read_to_string_lossy(file) {
  return fs.readFileSync(file, "utf8");
}

export function stat(file) {
  const stat = fs.statSync(file);
  return get_stat_struct(stat);
}

export function lstat(file) {
  const stat = fs.lstatSync(file);
  return get_stat_struct(stat);
}

export function read_dir(path, options, depth = 0) {
  const base = path;
  const exts = options?.extensions ?? options?.exts ?? [];

  const entries = fs.readdirSync(path, {
    ...options ?? {},
    withFileTypes: true,
  }).flatMap((entry) => {
    const res = [];
    const name = entry.name, path = `${base}/${name}`;
    try {
      const stat = fs.statSync(path);
      let include = stat && (!stat.isFile() || !exts?.length);
      if (stat?.isFile() && exts?.length) {
        include ||= exts.some((x) =>
          x?.length > 0 && x !== "." &&
          name.endsWith("." + x.replace(/^\./, ""))
        );
      }
      include && res.push(get_dirent_struct(path, entry, stat));
      if (options?.recursive && stat.isDirectory()) {
        // set a maximum depth to prevent infinite recursion
        if (++depth <= options?.maxDepth ?? 1e3) {
          res.push(...read_dir(path, options));
        }
      }
    } catch {
      // Ignore
    }
    return res;
  });

  return entries.filter(Boolean);
}

function get_dirent_struct(path, entry, stat) {
  const { name } = entry;
  const metadata = get_stat_struct(stat);
  const { is_file, is_directory, is_symlink } = metadata;
  return {
    name,
    path,
    metadata,
    is_file,
    is_directory,
    is_symlink,
    ...metadata,
  };
}

function get_stat_struct(stat) {
  return {
    is_file: stat.isFile(),
    is_directory: stat.isDirectory(),
    is_symlink: stat.isSymbolicLink(),
    size: stat.size ??= stat.isDirectory() ? 4096 : 0,
    mode: stat.mode ??= stat.isDirectory() ? 0o755 : 0o644,
    uid: stat.uid ??= 0,
    gid: stat.gid ??= 0,
    atime: stat.atimeMs ??= +(stat.atime ??= new Date()),
    mtime: stat.mtimeMs ??= +(stat.mtime ??= new Date()),
    ctime: stat.ctimeMs ??= +(stat.ctime ??= new Date()),
    birthtime: stat.birthtimeMs ??= +(stat.birthtime ??= new Date()),
    nlink: stat.nlink ??= 1,
  };
}
// #endregion File System API
