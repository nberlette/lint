/**
 * The `range` module provides the `Range` interface, which represents a range
 * of two positions in a given piece of source code, from `start` (inclusive)
 * to `end` (exclusive). It is used to represent the location of a diagnostic
 * message relative to a particular piece of source code.
 *
 * @module range
 */
export {
  /**
   * Represents a range of two positions in a given piece of source code,
   * from `start` (inclusive) to `end` (exclusive).
   *
   * @category Core
   * @tags range
   */
  TextRange as Range,
  /**
   * Represents a range of two positions in a given piece of source code,
   * from `start` (inclusive) to `end` (exclusive).
   *
   * @category Core
   * @tags range
   */
  TextRange as default,
  /**
   * Represents a generic range-like value, which can be a {@linkcode Range}
   * instance or a plain object with `start` and `end` properties that are
   * compatible {@linkcode PositionLike} values.
   *
   * @category Types
   * @tags range, positions, range-like
   */
  type RangeLike,
} from "@nick/fsxx";
