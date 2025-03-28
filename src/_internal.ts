// deno-lint-ignore-file no-explicit-any

/**
 * Checks if colors are enabled.
 *
 * Adapted from `@cliffy/internal/runtime/no-color`.
 * @internal
 */
export function getNoColor(): boolean {
  // dnt-shim-ignore
  if (typeof Deno !== "undefined") {
    return Deno.noColor;
  } else if (
    "process" in globalThis && typeof globalThis.process !== "undefined"
  ) {
    const env = globalThis.process.env;
    return env.NO_COLOR === "1" || env.NODE_DISABLE_COLORS === "1" ||
      env.TERM === "dumb" || env.FORCE_COLOR === "0" || env.COLORTERM === "0" ||
      env.COLORS === "0" || env.CLICOLOR === "0" || env.CLICOLOR_FORCE === "0";
  }
  // fallback to colorizing if console is available
  return hasConsole();
}

/**
 * Checks if console is available.
 * @internal
 */
export function hasConsole(): boolean {
  if (!("console" in globalThis)) return false;
  const c = globalThis.console;
  if (!c || typeof c !== "object") return false;
  return typeof c.log === "function" && typeof c.error === "function";
}

export type EnumKey<T, E> = keyof {
  [
    K in keyof E as E[K] extends string | number
      ? [E[K]] extends [T] ? K : never
      : never
  ]: K;
};

export type Restable<T> = T | [T];

export type strings = string & {};
