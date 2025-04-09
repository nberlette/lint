export type * from "./config.ts";

interface InputTypes {
  string: string;
  BufferSource: BufferSource;
}

/**
 * The supported input types for source code to be linted.
 *
 * @category Types
 */
export type InputType = InputTypes[keyof InputTypes];

// Lifted from https://raw.githubusercontent.com/denoland/deno_graph/89affe43c9d3d5c9165c8089687c107d53ed8fe1/lib/media_type.ts
export type MediaType =
  | "JavaScript"
  | "Mjs"
  | "Cjs"
  | "JSX"
  | "TypeScript"
  | "Mts"
  | "Cts"
  | "Dts"
  | "Dmts"
  | "Dcts"
  | "TSX"
  | "Json"
  | "Wasm"
  | "TsBuildInfo"
  | "SourceMap"
  | "Unknown";
