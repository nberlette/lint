// deno-lint-ignore-file no-var

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
var Proxy = _global.Proxy;
var Reflect = _global.Reflect;
var ArrayBuffer = _global.ArrayBuffer;
var Uint8Array = _global.Uint8Array;
var Error = _global.Error;
var Date = _global.Date;
var console = _global.console;
var startTime = Date.now();
var performance = _global.performance ?? { now: () => Date.now() - startTime };

var hasConsole = typeof console === "object" &&
  typeof console?.log === "function";
var isNode = typeof _global.process !== "undefined" &&
  typeof _global.process.versions !== "undefined" &&
  typeof _global.process.versions.node !== "undefined";
var isDeno = typeof _global.Deno !== "undefined" &&
  typeof _global.Deno.version !== "undefined" &&
  typeof _global.Deno.version.deno !== "undefined";

var _noGlobals = Symbol.for("dlint.no_globals");

// process.env polyfill that defers to the real process.env or Deno.env
// if either of those are available.
/**
 * @type {typeof import("node:process").default.env}
 */
export class ProcessEnv {
  constructor(env) {
    if (
      env !== _noGlobals &&
      arguments[1] !== _noGlobals
    ) {
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
    }
    if (env === _noGlobals) env = {};
    return new Proxy(env, {
      get: (t, k) => {
        if (typeof k === "string") {
          const key = k.toUpperCase();
          return t[key] ?? t[k];
        }
        return Reflect.get(t, k);
      },
      has: (t, k) => {
        if (typeof k === "string") {
          const key = k.toUpperCase();
          return key in t || k in t;
        }
        return Reflect.has(t, k);
      },
      set: (t, k, v) => {
        if (typeof k === "string") {
          const key = k.toUpperCase();
          t[key] = t[k] = v;
          return true;
        }
        return Reflect.set(t, k, v);
      },
      ownKeys: (t) => {
        const keys = new Set(Reflect.ownKeys(t));
        for (const key in t) {
          keys.add(key.toUpperCase());
        }
        return [...keys];
      },
      getOwnPropertyDescriptor: (t, k) => {
        let d = Reflect.getOwnPropertyDescriptor(t, k);
        if (typeof k === "string") {
          const key = k.toUpperCase();
          d ||= Reflect.getOwnPropertyDescriptor(t, key);
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
    if (isNode && fd !== _noGlobals && arguments[1] !== _noGlobals) {
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

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
  throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
  throw new Error("clearTimeout has not been defined");
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof _global.setTimeout === "function") {
  cachedSetTimeout = _global.setTimeout;
}
if (typeof _global.clearTimeout === "function") {
  cachedClearTimeout = _global.clearTimeout;
}

function runTimeout(fun) {
  if (cachedSetTimeout === _global.setTimeout) {
    //normal enviroments in sane situations
    return _global.setTimeout(fun, 0);
  }
  // if setTimeout wasn't available but was latter defined
  if (
    (cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
    _global.setTimeout
  ) {
    cachedSetTimeout = _global.setTimeout;
    return _global.setTimeout(fun, 0);
  }
  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (_) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (_) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === _global.clearTimeout) {
    //normal enviroments in sane situations
    return _global.clearTimeout(marker);
  }
  // if clearTimeout wasn't available but was latter defined
  if (
    (cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) &&
    _global.clearTimeout
  ) {
    cachedClearTimeout = _global.clearTimeout;
    return _global.clearTimeout(marker);
  }
  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (_) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (_) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }
  draining = false;
  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }
  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }
  var timeout = runTimeout(cleanUpNextTick);
  draining = true;

  var len = queue.length;
  while (len) {
    currentQueue = queue;
    queue = [];
    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }
    queueIndex = -1;
    len = queue.length;
  }
  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

// v8 likes predictible objects
class Item {
  constructor(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  run() {
    this.fun.apply(null, this.array);
  }
}

function noop() {}

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
  title = _global.process?.title ?? "browser";
  pid = _global.process?.pid ?? 0;
  platform = _global.process?.platform ?? "browser";
  arch = _global.process?.arch ?? "wasm32";
  version = _global.process?.version ?? "";
  versions = _global.process?.versions ?? {};
  release = _global.process?.release ?? {};
  config = _global.process?.config ?? {};
  browser = !isNode && !isDeno;

  constructor() {
    if (arguments[0] !== _noGlobals) {
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
  }

  on = noop;
  addListener = noop;
  once = noop;
  off = noop;
  removeListener = noop;
  removeAllListeners = noop;
  emit = noop;

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  #performance = {
    now: _global.performance.now ||
      _global.performance.mozNow ||
      _global.performance.msNow ||
      _global.performance.oNow ||
      _global.performance.webkitNow || function () {
      return +new Date();
    },
  };

  get exitCode() {
    return this.#exit_code;
  }

  set exitCode(code) {
    code = +code >>> 0;
    if (code > 255 || code < 0) throw new RangeError();
    this.#exit_code = code;
  }

  umask = (...args) => {
    return _global.process?.umask?.(...args) ?? (
      args.length ? void 0 : 0o222
    );
  };

  cwd = () => {
    if (isNode) return _global.process.cwd();
    if (isDeno) return _global.Deno.cwd();
    const s = sessionStorage;
    let d = s.getItem(this.#cwd_key);
    if (!d) s.setItem(this.#cwd_key, d = "/");
    return d;
  };

  chdir = (dir) => {
    if (isNode) return _global.process.chdir(dir);
    if (isDeno) return _global.Deno.chdir(dir);
    const s = sessionStorage;
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

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  hrtime = (previousTimestamp) => {
    var clocktime = this.#performance.now.call(performance) * 1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime % 1) * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds, nanoseconds];
  };

  #startTime = new Date();
  uptime = () => {
    var currentTime = new Date();
    var dif = currentTime - this.#startTime;
    return dif / 1000;
  };

  binding(_name) {
    throw new Error("process.binding is not supported");
  }

  nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (let i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) runTimeout(drainQueue);
  }
}

export const process = new Process();
