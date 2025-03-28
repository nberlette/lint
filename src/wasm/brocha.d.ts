/**
 * Decodes a sample of Brotli-encoded data into a `Uint8Array`.
 *
 * For maximum compatibility, this function accepts several input types:
 *
 * - UTF8-encoded string of compressed brotli data
 * - `ArrayBuffer`, `SharedArrayBuffer`, or any `ArrayBufferView`:
 * - `Uint8Array`, `Float32Array`, `BigInt64Array`, `DataView`, ...
 * - `Buffer` objects from Node.js (which is a subclass of `Uint8Array`)
 *
 * @param input The Brotli-compressed data to be decoded.
 * @param [options] Custom decompression options (if any), allowing you to pass
 * in a custom dictionary to the decoder. See {@linkcode BrotliDecodeOptions}
 * for details on custom dictionary requirements and usage.
 * @returns The decompressed data, as a `Uint8Array` object.
 * @example Decompressing a Brotli-compressed file:
 * ```ts
 * import { decompress } from "@nick/brotli";
 * import * as fs from "node:fs";
 *
 * const compressed = fs.readFileSync("data.wasm.br");
 * const decompressed = decompress(compressed);
 *
 * const input = +(compressed.byteLength / 1024).toFixed(0);
 * const output = +(decompressed.byteLength / 1024).toFixed(0);
 * console.log(`${input}K => ${output} K (+${(input / output).toFixed(2)}x)`);
 * // Example log: "115K => 483K (+4.2x)"
 * ```
 * @example Instantiating a brotli-compressed WebAssembly module:
 * ```ts no-eval
 * import { decompress } from "@nick/brotli";
 * import { add, instantiate } from "./add.generated.js";
 *
 * await instantiate({ decompress });
 * console.log(add(1, 2)); // 3
 * ```
 */
export declare function decompress(
  input: BufferSource,
  options?: BrotliDecodeOptions,
): Uint8Array;

export default decompress;

/**
 * Options for the {@linkcode decompress} function, to customize the behavior
 * of the Brotli decompression process. Currently the only supported option is
 * a custom dictionary for the decompressor to use.
 *
 * @category Options
 */
export interface BrotliDecodeOptions {
  /**
   * Custom dictionary to use for the Brotli decompression process. This should
   * be a BufferSource object containing text-based dictionary data, or `null`
   * to use the default dictionary.
   *
   * @remarks
   * The dictionary must be a valid Brotli dictionary, and must be the same
   * dictionary that was used to compress the data. If the dictionary is not
   * valid, or if it does not match the dictionary used to compress the data,
   * the decompression process will almost certainly fail.
   */
  customDictionary: BufferSource | null;
}
