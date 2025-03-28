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
var Map = _global.Map;
var WeakMap = _global.WeakMap;
var Proxy = _global.Proxy;
var Reflect = _global.Reflect;
var Symbol = _global.Symbol;
var Object = _global.Object;

var STORAGE = new WeakMap();

function getStore(storage, create) {
  let store = STORAGE.get(storage);
  if (!store && create) STORAGE.set(storage, store = new Map());
  return store;
}

const _useSessionStorage = Symbol.for("dlint.use_session_storage");
const _noGlobals = Symbol.for("dlint.no_globals");

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
      arguments[0] !== _noGlobals &&
      arguments[1] !== _noGlobals
    ) {
      let result;
      loop: while (true) {
        if (result?.status === "success") {
          if (
            arguments[0] === _useSessionStorage ||
            arguments[1] === _useSessionStorage
          ) {
            return result.sessionStorage;
          } else {
            return result.localStorage;
          }
        }

        try {
          if (
            (_global.sessionStorage &&
              !(_global.sessionStorage instanceof Storage)) ||
            arguments[0] === _useSessionStorage
          ) {
            return _global.sessionStorage;
          } else if (
            _global.localStorage && !(_global.localStorage instanceof Storage)
          ) {
            return _global.localStorage;
          }
        } catch (_) {
          result = installPolyfill();
          continue loop;
        }
        break loop;
      }
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
