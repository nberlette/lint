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

var Map = _global.Map;
var Error = _global.Error;
var Date = _global.Date;

// export var timeOrigin = performance.timeOrigin ??= Date.now();

export class Performance {
  #timeOrigin = Date.now();
  #entries = new Map();

  get timeOrigin() {
    return this.#timeOrigin;
  }

  now = () => Date.now() - this.#timeOrigin;

  mark = (name, options) => {
    if (typeof name !== "string") {
      throw new TypeError("mark name must be a string");
    }
    let entry = this.#entries.get(name);
    if (!entry) {
      entry = { entryType: "mark", startTime: this.now(), ...options, name };
      this.#entries.set(name, entry);
    }
    return entry;
  };

  clearMarks = (name) => {
    if (name === undefined) {
      return this.#entries.clear();
    } else {
      return this.#entries.delete(name);
    }
  };

  getEntries = () => Array.from(this.#entries.values());

  getEntriesByName = (name) => {
    return this.getEntries().filter((entry) => entry.name === name);
  };

  getEntriesByType = (type) => {
    return this.getEntries().filter((entry) => entry.entryType === type);
  };

  measure = (name, startMark, endMark) => {
    const startEntry = this.#entries.get(startMark);
    let endEntry = this.#entries.get(endMark);
    if (!startEntry) throw new Error("mark not found");
    if (!endEntry) {
      endEntry = this.mark(
        typeof endMark === "string"
          ? endMark
          : endMark.name || startMark + ":end",
        {
          startTime: this.now(),
          ...typeof endMark === "object" && endMark ? endMark : {},
        },
      );
    }
    const duration = endEntry.startTime - startEntry.startTime;
    return this.mark(name, { entryType: "measure", duration });
  };
}

export var performance = _global.performance ?? new Performance();
