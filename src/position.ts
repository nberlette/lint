/**
 * This module provides the `Position` interface, which represents a single
 * position in a given piece of source code, in terms of the line number,
 * column number, and byte offset.
 *
 * @module position
 */

export {
  /**
   * Represents a single position in a given piece of source code, in terms of
   * the line number, column number (`col`), and byte offset (`bytePos`).
   *
   * @category Core
   * @tags position
   */
  Position,
  /**
   * Represents a single position in a given piece of source code, in terms of
   * the line number, column number (`col`), and byte offset (`bytePos`).
   *
   * @category Core
   * @tags position
   */
  Position as default,
  /**
   * Represents a generic position-like value, which can be a
   * {@linkcode Position} instance or a plain object with `line`, `col`, and
   * `bytePos` properties.
   *
   * @category Types
   * @tags position, position-like
   */
  type PositionLike,
} from "@nick/fsxx/position";
