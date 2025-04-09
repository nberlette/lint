/**
 * This module provides the `DiagnosticLevel` enum, which represents the
 * severity levels of a diagnostic message: `Error`, `Warning`, and `Hint`.
 * @module level
 */

/**
 * The severity levels of a diagnostic message.
 *
 * @category Diagnostics
 */
export enum DiagnosticLevel {
  /** Error diagnostics, indicating a problem that must be fixed. (default) */
  Error = "error",
  /** Warning diagnostics, indicating either a minor/stylistic problem, or a
   * potential problem that could be fixed. */
  Warning = "warning",
  /** Hint diagnostics, indicating a suggestion for improvement. */
  Hint = "hint",
}

/**
 * Represents the name of a diagnostic level.
 *
 * @category Diagnostics
 */
export type DiagnosticLevelName = `${DiagnosticLevel}`;
