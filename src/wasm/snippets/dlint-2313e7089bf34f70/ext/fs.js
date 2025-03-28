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

// var to avoid needless TDZ checks. also allows hoisting + reassignment.
import { localStorage } from "./storage.js";
import { process } from "./process.js";

/** @type {typeof global} */
var _global = (() => {
  try {
    // deno-lint-ignore no-node-globals
    return globalThis ?? global ?? self ?? window ?? this ?? (0, eval)("this");
  } catch (_) {
    // if there's no global object, we shouldn't assume there's a global
    // Error object either, so just throw a swtring. this should seriously
    // never ever ever happen. but hey, who knows.
    throw "Unable to locate global object";
  }
})();

var Set = _global.Set;
var Error = _global.Error;
var Date = _global.Date;

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
  #sep = "/";
  #storage = localStorage;
  #base_key = "dlint_vfs";
  #get_prefix = (label = "path") => `[${this.#base_key}]:${label}`;
  #get_key = (path = this.#sep, type = "path") => `${this.#get_prefix(type)}=${path}`;
  #prefix = this.#get_prefix("path");
  #inode_key = this.#get_prefix("inode");

  /**
   * Creates a new instance of the Virtual File System (VFS) class.
   *
   * @param {object} [options] Optional configuration options.
   * @property {string} [options.prefix="dlint:vfs::path="] The prefix to use
   * for storage keys.
   * @property {string} [options.sep="/"] The path separator to use.
   * @property {Storage} [options.storage=localStorage] The storage object to
   * use for storing file system data. Must implement the Web Storage API.
   */
  constructor(options = {}) {
    if (options.prefix) {
      this.#base_key = options.prefix;
      this.#prefix = this.#get_prefix("path");
      this.#inode_key = this.#get_prefix("inode");
    }
    if (options.sep) this.#sep = options.sep;
    // Initialize inode counter if not present
    if (!this.#storage.getItem(this.#inode_key)) {
      this.#storage.setItem(this.#inode_key, "1");
    }
    // Initialize root directory if not present
    const root = this.#sep;
    if (!this.existsSync(root)) {
      this.mkdirSync(root, { recursive: true });
    }
  }

  // ---------- Inode Table Helpers ----------

  #getInodeKey(id) {
    return this.#get_key(id, "inode");
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
    const counterKey = this.#inode_key;
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
    if (record.type === "symlink") path = record.target;
    // normalize the path a bit
    path = path.replace(/[\\/]+/g, "/").replace(/\/$/, "");
    const cwd = process.cwd() + "/";
    path = path.replace(/^(?:\.\/|(?!\/))/, cwd).replace(/[\\/]+/g, "/");
    // resolve relative paths, e.g. a/../foo/./bar -> /a/foo/bar
    if (options?.canonicalize) {
      path = path.replace(/\/+|\/\.\//g, "/");
      path = path.replace(/\/(?:(?!\.\.)[^/]+)\/\.\.\/?/g, "/");
      return path
        .replace(/(\/|^)([^/]+)\/\.\.(\/|$)/, "$1$3")
        .replace(/\/+|(?:\/\.)+\/?/g, "/")
        .replace(/^\s*$/, "/")
        .replace(/\/+/g, this.#sep);
    }
    return path;
  }

  // ---------- Metadata Modification ----------

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

export const vfs = new VFS();

// #endregion Virtual File System (VFS)

/** @type {typeof import("node:fs")} */
export var fs = await import("node:fs").then(
  (m) => m.default ?? m,
  () => new VFS(),
);

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

export function read_text_file(file) {
  return fs.readFileSync(file, "utf8");
}

export function write_text_file(file, data) {
  fs.writeFileSync(file, data, "utf8");
}

export function stat(file) {
  const stat = fs.statSync(file);
  return get_stat_struct(stat);
}

export function lstat(file) {
  const stat = fs.lstatSync(file);
  return get_stat_struct(stat);
}

export function resolve_path(path) {
  return fs.realpathSync(path);
}

export function read_dir(path, options, depth = 0) {
  const base = path;
  const entries = fs.readdirSync(path, {
    ...options ?? {},
    withFileTypes: true,
  }).flatMap((entry) => {
    const res = [];
    const name = entry.name, path = `${base}/${name}`;
    try {
      const stat = fs.statSync(path);
      res.push(get_dirent_struct(path, entry, stat));
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

export function get_dirent_struct(path, entry, stat) {
  const { name } = entry;
  const metadata = get_stat_struct(stat);
  const { is_file, is_directory, is_symlink } = metadata;
  path = resolve_path(path);
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

export function get_stat_struct(stat) {
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
