#![cfg(target_arch = "wasm32")]
#![allow(unexpected_cfgs)]
#![allow(unused_imports)]
#![allow(wasm_c_abi)]
#![feature(stmt_expr_attributes)]
#![feature(io_error_more)]

extern crate alloc;

#[cfg(all(feature = "alloc", not(feature = "threads")))]
use lol_alloc::AssumeSingleThreaded;
#[cfg(feature = "alloc")]
use lol_alloc::FreeListAllocator;
#[cfg(all(feature = "alloc", feature = "threads"))]
use lol_alloc::LockedAllocator;
use wasm_bindgen::prelude::*;

#[global_allocator]
#[cfg(all(feature = "alloc", not(feature = "threads")))]
// SAFETY: This app is single threaded, so AssumeSingleThreaded is allowed.
static ALLOCATOR: AssumeSingleThreaded<FreeListAllocator> =
  unsafe { AssumeSingleThreaded::new(FreeListAllocator::new()) };

#[global_allocator]
#[cfg(all(feature = "alloc", feature = "threads"))]
static ALLOCATOR: LockedAllocator<FreeListAllocator> =
  LockedAllocator::new(FreeListAllocator::new());

use core::convert::Into;
use core::iter::{self as _, FromIterator};
use core::ops::Range;
use std::borrow::Cow;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::io::{Error, ErrorKind};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, LazyLock, Mutex, Weak};
use std::vec;

use ::wasm_bindgen::intern;
use deno_ast::diagnostics::{
  Diagnostic as DenoDiagnostic,
  DiagnosticLevel as DenoDiagnosticLevel,
  DiagnosticSnippet as DenoDiagnosticSnippet,
  DiagnosticSnippetHighlightStyle as DenoDiagnosticSnippetHighlightStyle,
  DiagnosticSourcePos as DenoDiagnosticSourcePos,
  DiagnosticSourceRange as DenoDiagnosticSourceRange,
};
use deno_ast::swc::common::source_map::SmallPos;
use deno_ast::{
  MediaType,
  ModuleSpecifier,
  ParseDiagnostic,
  ParseParams,
  ParsedSource,
  SourcePos,
  SourceRange as DenoSourceRange,
  SourceTextInfo,
  TextLines,
  parse_program,
};
use deno_lint::diagnostic::{
  LintDiagnostic as DenoLintDiagnostic,
  LintDiagnosticDetails as DenoLintDiagnosticDetails,
  LintDiagnosticRange as DenoLintDiagnosticRange,
  LintDocsUrl,
};
use deno_lint::linter::{
  LintConfig as DenoLintConfig,
  LintFileOptions as DenoLintFileOptions,
  Linter as DenoLinter,
  LinterOptions as DenoLinterOptions,
};
use deno_lint::rules::{LintRule, filtered_rules, get_all_rules, recommended_rules};
use deno_lint::tags;
use derive_more::with_trait::{AsRef, Constructor, Deref, DerefMut, Display, From, IsVariant};
use serde::ser::SerializeStruct as _;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

//////////////////// macros /////////////////////

macro_rules! impl_from_enum {
  (
    $from:ty => $to:path {
      $(
        $variant:ident
      ),* $(,)?
    } $(,)?
  ) => {
    impl From<$from> for $to {
      fn from(mode: $from) -> $to {
        match mode {
          $( <$from>::$variant => <$to>::$variant ),*
        }
      }
    }

    impl From<$to> for $from {
      fn from(mode: $to) -> $from {
        match mode {
          $( <$to>::$variant => <$from>::$variant ),*
        }
      }
    }
  };
}

macro_rules! static_str {
  ($expr:expr) => {
    unsafe { ::std::mem::transmute::<_, &'static str>(&*$expr) }
  };
}

//////////////////// end macros /////////////////////

/// Returns the version of the `deno_lint` crate used to build this module.
#[wasm_bindgen(js_name = version)]
pub fn version() -> String {
  env!("CARGO_PKG_VERSION").to_string()
}

#[derive(Clone, Copy, AsRef, Deref, Hash, PartialEq, Debug, Serialize, Deserialize, Display)]
#[serde(remote = "tags::Tag")]
pub struct Tag(#[serde(getter = "tags::Tag::display")] pub(crate) &'static str);

impl Tag {
  pub const ALL_TAGS: &[Tag] = &[Tag::RECOMMENDED, Tag::FRESH, Tag::JSR, Tag::REACT, Tag::JSX];
  pub const FRESH: Tag = Tag("fresh");
  pub const JSR: Tag = Tag("jsr");
  pub const JSX: Tag = Tag("jsx");
  pub const REACT: Tag = Tag("react");
  pub const RECOMMENDED: Tag = Tag("recommended");
}

impl Eq for Tag {}

impl Ord for Tag {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    self.0.cmp(other.0)
  }
}

impl PartialOrd for Tag {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(self.cmp(other))
  }
}

impl From<tags::Tag> for Tag {
  fn from(tag: tags::Tag) -> Self {
    Tag::from(&tag)
  }
}

impl From<Tag> for tags::Tag {
  fn from(tag: Tag) -> tags::Tag {
    match tag {
      | Tag::RECOMMENDED => tags::RECOMMENDED,
      | Tag::FRESH => tags::FRESH,
      | Tag::JSR => tags::JSR,
      | Tag::REACT => tags::REACT,
      | Tag::JSX => tags::JSX,
      | _ => tags::RECOMMENDED,
    }
  }
}

impl<T: AsRef<Tag>> From<T> for Tag {
  fn from(tag: T) -> Self {
    tag.as_ref().clone()
  }
}

impl From<&tags::Tag> for Tag {
  fn from(tag: &tags::Tag) -> Self {
    match tag {
      | &tags::FRESH => Tag::FRESH,
      | &tags::JSR => Tag::JSR,
      | &tags::JSX => Tag::JSX,
      | &tags::REACT => Tag::REACT,
      | &tags::RECOMMENDED => Tag::RECOMMENDED,
      | _ => Tag(tag.display()),
    }
  }
}

impl From<&'static str> for Tag {
  fn from(tag: &'static str) -> Self {
    match tag {
      "fresh" | "jsr" | "react" | "jsx" => Tag(tag),
      _ => Tag("recommended"),
    }
  }
}

/// Options for configuring {@linkcode Linter} instances.
///
/// # Examples
///
/// ```ts
/// import { Linter, LinterOptions } from "jsr:@nick/lint";
///
/// // all arguments are optional
/// const options = new LinterOptions(
///   ["recommended"], // enabled rule tags
///   ["no-explicit-any"], // excluded rules
///   ["no-unused-vars"], // included rules
///   "deno-lint-ignore-file", // custom ignore file directive
///   "deno-lint-ignore", // custom ignore diagnostic directive
///   "React.createElement", // default JSX factory
///   "React.Fragment", // default JSX fragment factory
/// );
///
/// // you can also set options via the setter methods
///
/// // eslint-style directives
/// options.ignore_file_directive = "eslint-ignore";
/// options.ignore_diagnostic_directive = "eslint-disable";
///
/// // preact-style factories for jsx
/// options.default_jsx_factory = "h"; // Preact
/// options.default_jsx_fragment_factory = "Fragment"; // Preact
///
/// const linter = new Linter(options);
///
/// const res = linter.lint(`console.log("Hello, world!");`, "example.ts");
///
/// console.log(res);
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LinterOptions {
  /// Enabled rule tags. An empty array disables all rules, allowing
  /// you to selectively include them as-needed using {@linkcode include}.
  ///
  /// Defaults to `["recommended"]`.
  pub tags: Vec<String>,
  /// Excluded rule codes. Any rules present here will override any
  /// rules included by the {@linkcode tags} option. The {@linkcode include}
  /// option, however, takes priority over this option, allowing you to include
  /// specific rules even if they were already excluded from linting.
  pub exclude: Vec<String>,
  /// Included rule codes. Any rules present here will override any
  /// rules excluded by the {@linkcode exclude} option. This allows you to pick
  /// and choose which rules to include, even if they were already excluded by
  /// the {@linkcode exclude} option.
  pub include: Vec<String>,
  /// Sets the ignore file directive. Defaults to `"deno-lint-ignore-file"`,
  /// which is the default directive used by Deno's built-in linter. To support
  /// ESLint-style ignore directives, you can set this to `"eslint-ignore"`,
  /// for example.
  #[serde(skip_serializing_if = "Option::is_none")]
  pub custom_ignore_file_directive: Option<String>,
  /// Sets the ignore diagnostic directive, which is used to ignore a specific
  /// diagnostic message by placing it on the line immediately before it, and
  /// including the diagnostic code after the directive text. Defaults to
  /// `"deno-lint-ignore"`, which is the default directive used by Deno's
  /// built-in linter.
  #[serde(skip_serializing_if = "Option::is_none")]
  pub custom_ignore_diagnostic_directive: Option<String>,
  /// Sets the default JSX factory. Defaults to `undefined`, which means that
  /// the linter will use `React.createElement` if it is handling JSX code.
  ///
  /// Frameworks like Preact can be supported by setting this to e.g. `"h"`.
  #[serde(skip_serializing_if = "Option::is_none")]
  pub default_jsx_factory: Option<String>,

  /// Sets the default JSX fragment factory. Defaults to `undefined`, which
  /// means that the linter will use `React.Fragment` if it is handling JSX
  /// code.
  ///
  /// Frameworks like Preact can be supported by setting this to e.g.
  /// `"Fragment"`.
  #[serde(skip_serializing_if = "Option::is_none")]
  pub default_jsx_fragment_factory: Option<String>,
}

impl Default for LinterOptions {
  fn default() -> Self {
    LinterOptions {
      tags: vec!["recommended".to_string()],
      exclude: vec![],
      include: vec![],
      custom_ignore_file_directive: Some("deno-lint-ignore-file".to_string()),
      custom_ignore_diagnostic_directive: Some("deno-lint-ignore".to_string()),
      default_jsx_factory: Some("React.createElement".to_string()),
      default_jsx_fragment_factory: Some("React.Fragment".to_string()),
    }
  }
}

impl From<DenoLinterOptions> for LinterOptions {
  fn from(options: DenoLinterOptions) -> Self {
    let mut tags: Vec<String> = options
      .rules
      .iter()
      .flat_map(|r| r.tags().iter().map(|t| t.to_string()).collect::<Vec<_>>())
      .collect();
    tags.sort();
    tags.dedup();
    let exclude = options
      .rules
      .iter()
      .filter(|r| !options.all_rule_codes.contains(r.code()))
      .map(|r| r.code().to_string())
      .collect();
    let include = options
      .rules
      .iter()
      .filter(|r| options.all_rule_codes.contains(r.code()))
      .map(|r| r.code().to_string())
      .collect();
    let custom_ignore_file_directive = options
      .custom_ignore_file_directive
      .or_else(Default::default)
      .map(|s| s.to_string());
    let custom_ignore_diagnostic_directive = options
      .custom_ignore_diagnostic_directive
      .or_else(Default::default)
      .map(|s| s.to_string());

    LinterOptions {
      tags,
      exclude,
      include,
      custom_ignore_file_directive,
      custom_ignore_diagnostic_directive,
      default_jsx_factory: None,
      default_jsx_fragment_factory: None,
    }
  }
}

impl From<LinterOptions> for DenoLinterOptions {
  fn from(options: LinterOptions) -> Self {
    let maybe_tags = Some(options.tags.clone());
    let maybe_exclude = Some(options.exclude.clone());
    let maybe_include = Some(options.include.clone());
    let all_rules = get_all_rules();
    let all_rule_codes = HashSet::from_iter(
      get_all_rules()
        .iter()
        .map(|r| r.code().into())
        .collect::<Vec<_>>(),
    );
    let mut custom_ignore_file_directive: Option<&'static str> = None;
    let mut custom_ignore_diagnostic_directive: Option<&'static str> = None;

    if let Some(directive) = options.custom_ignore_file_directive {
      let directive_str = static_str!(directive);
      custom_ignore_file_directive = Some(directive_str);
    }

    if let Some(directive) = options.custom_ignore_diagnostic_directive {
      let directive_str = static_str!(directive);
      custom_ignore_diagnostic_directive = Some(directive_str);
    }

    let rules = filtered_rules(all_rules, maybe_tags, maybe_exclude, maybe_include);

    DenoLinterOptions {
      rules,
      all_rule_codes,
      custom_ignore_file_directive,
      custom_ignore_diagnostic_directive,
    }
  }
}

impl From<LinterOptions> for DenoLintConfig {
  fn from(options: LinterOptions) -> Self {
    let default_jsx_factory = options.default_jsx_factory.clone();
    let default_jsx_fragment_factory = options.default_jsx_fragment_factory.clone();

    DenoLintConfig {
      default_jsx_factory,
      default_jsx_fragment_factory,
    }
  }
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Position {
  pub line: u32,
  pub col: u32,
  pub byte_pos: u32,
}

impl Position {
  pub fn new(line: impl Into<u32>, col: impl Into<u32>, byte_pos: impl Into<u32>) -> Self {
    Self {
      line: line.into(),
      col: col.into(),
      byte_pos: byte_pos.into(),
    }
  }

  #[inline(always)]
  pub fn interpolate_line_and_col(&self, source: &str) -> (u32, u32) {
    let lines = TextLines::new(source);
    let byte_index = self.byte_pos.try_into().unwrap();
    let line_index = lines.line_index(byte_index);
    let line = line_index as u32;
    let line_start = lines.line_start(line_index) as u32;
    let col = self.byte_pos - line_start;

    (line, col)
  }

  #[inline(always)]
  pub fn interpolate_byte_pos(&self, source: &str) -> u32 {
    let lines = TextLines::new(source);
    let line = self.line.min(lines.lines_count() as u32 - 1);
    let col = self.col.min(lines.line_end(line as usize) as u32) as u32;

    lines.line_start(line as usize) as u32 + col
  }

  #[inline(always)]
  pub fn interpolate(&self, source: &str) -> (u32, u32, u32) {
    if self.line == 0 && self.col == 0 {
      if self.byte_pos == 0 {
        (0, 0, 0)
      } else {
        let (line, col) = self.interpolate_line_and_col(source);
        (line, col, self.byte_pos)
      }
    } else {
      if self.byte_pos == 0 {
        let byte_pos = self.interpolate_byte_pos(source);
        (self.line, self.col, byte_pos)
      } else {
        (self.line, self.col, self.byte_pos)
      }
    }
  }
}

impl From<usize> for Position {
  fn from(pos: usize) -> Self {
    let byte_pos: u32 = pos as u32;
    Self {
      line: 0,
      col: 0,
      byte_pos,
    }
  }
}

impl From<Position> for usize {
  fn from(pos: Position) -> usize {
    pos.byte_pos as usize
  }
}

impl From<(u32, u32, u32)> for Position {
  fn from((line, col, byte_pos): (u32, u32, u32)) -> Self {
    Position {
      line,
      col,
      byte_pos,
    }
  }
}

impl From<Position> for (u32, u32, u32) {
  fn from(pos: Position) -> (u32, u32, u32) {
    (pos.line, pos.col, pos.byte_pos)
  }
}

impl From<Position> for SourcePos {
  fn from(pos: Position) -> Self {
    let pos = pos.byte_pos as usize;
    let byte_pos = deno_ast::swc::common::BytePos::from_usize(pos + 1);
    SourcePos::unsafely_from_byte_pos(byte_pos)
  }
}

impl From<SourcePos> for Position {
  fn from(pos: SourcePos) -> Self {
    let byte_pos = pos.as_byte_pos().0 as u32 - 1;
    Position {
      byte_pos,
      ..Default::default()
    }
  }
}

impl From<DenoDiagnosticSourcePos> for Position {
  fn from(pos: DenoDiagnosticSourcePos) -> Self {
    match pos {
      | DenoDiagnosticSourcePos::SourcePos(source_pos) => source_pos.into(),
      | DenoDiagnosticSourcePos::ByteIndex(byte_pos) => Position {
        line: 0,
        col: 0,
        byte_pos: byte_pos as u32 - 1,
      },
      | DenoDiagnosticSourcePos::LineAndCol { line, column } => Position {
        line: line as u32,
        col: column as u32,
        byte_pos: 0u32,
      },
    }
  }
}

impl From<Position> for DenoDiagnosticSourcePos {
  fn from(pos: Position) -> Self {
    if pos.line == 0 && pos.col == 0 {
      DenoDiagnosticSourcePos::ByteIndex(pos.byte_pos as usize + 1)
    } else {
      DenoDiagnosticSourcePos::LineAndCol {
        line: pos.line as usize,
        column: pos.col as usize,
      }
    }
  }
}

#[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Default)]
pub struct SourceRange {
  pub start: Position,
  pub end: Position,
}

impl SourceRange {
  pub fn new(start: impl Into<Position>, end: impl Into<Position>) -> Self {
    SourceRange {
      start: start.into(),
      end: end.into(),
    }
  }
}

impl From<SourceRange> for Range<u32> {
  fn from(range: SourceRange) -> Self {
    range.start.byte_pos..range.end.byte_pos
  }
}

impl From<Range<usize>> for SourceRange {
  fn from(range: Range<usize>) -> Self {
    let start: Position = range.start.into();
    let end: Position = range.end.into();
    SourceRange { start, end }
  }
}

impl From<u32> for Position {
  fn from(pos: u32) -> Self {
    Position {
      line: 0,
      col: 0,
      byte_pos: pos,
    }
  }
}

impl From<(u32, u32)> for SourceRange {
  fn from(range: (u32, u32)) -> Self {
    let start: Position = range.0.into();
    let end: Position = range.1.into();
    SourceRange { start, end }
  }
}

impl From<SourceRange> for (u32, u32) {
  fn from(range: SourceRange) -> Self {
    (range.start.byte_pos, range.end.byte_pos)
  }
}

impl From<SourceRange> for (usize, usize) {
  fn from(range: SourceRange) -> Self {
    (range.start.byte_pos as usize, range.end.byte_pos as usize)
  }
}

impl From<DenoSourceRange<SourcePos>> for SourceRange {
  fn from(range: DenoSourceRange<SourcePos>) -> Self {
    let start: Position = range.start.into();
    let end: Position = range.end.into();
    SourceRange { start, end }
  }
}

impl From<SourceRange> for DenoSourceRange<SourcePos> {
  fn from(range: SourceRange) -> Self {
    let start: SourcePos = range.start.into();
    let end: SourcePos = range.end.into();
    DenoSourceRange { start, end }
  }
}

impl From<SourceRange> for Range<usize> {
  fn from(range: SourceRange) -> Self {
    range.start.into()..range.end.into()
  }
}

impl From<DenoDiagnosticSourceRange> for SourceRange {
  fn from(range: DenoDiagnosticSourceRange) -> Self {
    let start: Position = range.start.into();
    let end: Position = range.end.into();
    SourceRange { start, end }
  }
}

impl From<DenoLintDiagnosticRange> for SourceRange {
  fn from(range: DenoLintDiagnosticRange) -> Self {
    let start: Position = range.range.start.into();
    let end: Position = range.range.end.into();
    SourceRange { start, end }
  }
}

#[derive(Debug, Clone, Constructor, Hash, PartialEq, Eq, PartialOrd, Ord, Default)]
pub struct LintDiagnosticRange {
  pub text: String,
  pub range: SourceRange,
  pub description: Option<String>,
}

impl Serialize for LintDiagnosticRange {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::Serializer,
  {
    let mut state = serializer.serialize_struct("LintDiagnosticRange", 3)?;
    // only include the text within the range
    // first checking if it's empty or not, then checking
    // if its longer than the range
    let text = if self.text.is_empty() {
      None
    } else {
      let start = self.range.start.byte_pos as usize;
      let end = self.range.end.byte_pos as usize;
      let len = end - start;
      if len > 0 && len <= self.text.len() {
        Some(self.text[start..end].to_string())
      } else if len > 0 {
        Some(self.text[..len].to_string())
      } else {
        None
      }
    };
    state.serialize_field("text", &text)?;
    state.serialize_field("range", &self.range)?;
    if let Some(ref description) = self.description {
      state.serialize_field("description", description)?;
    }
    state.end()
  }
}

impl From<DenoLintDiagnostic> for LintDiagnosticRange {
  fn from(diagnostic: DenoLintDiagnostic) -> Self {
    if diagnostic.range.is_none() {
      return Default::default();
    } else {
      let range = diagnostic.range.unwrap();
      let text_str = range.text_info.text_str();
      let start = range.range.start.as_byte_pos().0 as u32 - 1;
      let end = range.range.end.as_byte_pos().0 as u32 - 1;

      LintDiagnosticRange {
        text: text_str.to_string(),
        range: (start, end).into(),
        description: range.description.map(|s| s.to_string()),
      }
    }
  }
}

impl From<LintDiagnosticRange> for DenoLintDiagnosticRange {
  fn from(range: LintDiagnosticRange) -> Self {
    DenoLintDiagnosticRange {
      text_info: SourceTextInfo::from_string(range.text.clone()),
      range: range.range.into(),
      description: range.description.map(|s| s.into()),
    }
  }
}

impl From<DenoLintDiagnosticRange> for LintDiagnosticRange {
  fn from(range: DenoLintDiagnosticRange) -> Self {
    let text_str = range.text_info.text_str();
    let text = text_str.to_string();

    LintDiagnosticRange {
      text,
      range: range.range.into(),
      description: range.description.map(|s| s.into()),
    }
  }
}

impl From<(usize, usize)> for LintDiagnosticRange {
  fn from(range: (usize, usize)) -> Self {
    let start: Position = range.0.into();
    let end: Position = range.1.into();

    LintDiagnosticRange {
      text: String::new(),
      range: SourceRange { start, end },
      description: None,
    }
  }
}

impl From<DenoSourceRange> for LintDiagnosticRange {
  fn from(range: DenoSourceRange) -> Self {
    let start: Position = range.start.into();
    let end: Position = range.end.into();

    LintDiagnosticRange {
      range: SourceRange { start, end },
      ..Default::default()
    }
  }
}

#[derive(
  Debug,
  Clone,
  Copy,
  Hash,
  Default,
  PartialEq,
  Eq,
  PartialOrd,
  Ord,
  Serialize,
  Deserialize,
  IsVariant,
  From,
  Display,
)]
#[repr(u32)]
#[serde(rename_all = "lowercase", untagged)]
#[display("{}", _variant)]
pub enum LintDiagnosticLevel {
  #[default]
  #[display("error")]
  Error   = 0,
  #[display("warning")]
  Warning = 1,
  #[display("hint")]
  Hint    = 2,
}

impl_from_enum! {
  LintDiagnosticLevel => DenoDiagnosticSnippetHighlightStyle {
    Error,
    Warning,
    Hint,
  }
}

impl From<DenoDiagnosticLevel> for LintDiagnosticLevel {
  fn from(level: DenoDiagnosticLevel) -> Self {
    match level {
      | DenoDiagnosticLevel::Error => LintDiagnosticLevel::Error,
      | DenoDiagnosticLevel::Warning => LintDiagnosticLevel::Warning,
    }
  }
}

impl From<LintDiagnosticLevel> for DenoDiagnosticLevel {
  fn from(level: LintDiagnosticLevel) -> Self {
    match level {
      | LintDiagnosticLevel::Warning => DenoDiagnosticLevel::Warning,
      | _ => DenoDiagnosticLevel::Error,
    }
  }
}

impl From<u32> for LintDiagnosticLevel {
  fn from(level: u32) -> Self {
    match level {
      | 1 => LintDiagnosticLevel::Warning,
      | 2 => LintDiagnosticLevel::Hint,
      | _ => LintDiagnosticLevel::Error,
    }
  }
}

impl From<LintDiagnosticLevel> for u32 {
  fn from(level: LintDiagnosticLevel) -> Self {
    match level {
      | LintDiagnosticLevel::Warning => 1,
      | LintDiagnosticLevel::Hint => 2,
      | _ => 0,
    }
  }
}

impl From<LintDiagnosticLevel> for &'static str {
  fn from(level: LintDiagnosticLevel) -> Self {
    match level {
      | LintDiagnosticLevel::Error => "error",
      | LintDiagnosticLevel::Warning => "warning",
      | LintDiagnosticLevel::Hint => "hint",
    }
  }
}

impl From<&LintDiagnosticLevel> for &'static str {
  fn from(level: &LintDiagnosticLevel) -> Self {
    level.clone().into()
  }
}

impl From<LintDiagnosticLevel> for String {
  fn from(value: LintDiagnosticLevel) -> Self {
    let str: &'static str = value.into();
    str.to_string()
  }
}

#[derive(Debug, Clone, Constructor, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize)]
pub struct LintDiagnosticSnippet {
  pub source: String,
  pub range: SourceRange,
  pub highlights: Vec<(SourceRange, LintDiagnosticLevel)>,
}

impl From<DenoDiagnosticSnippet<'_>> for LintDiagnosticSnippet {
  fn from(snippet: DenoDiagnosticSnippet<'_>) -> Self {
    let source_text = snippet.source.into_owned();
    // let source = source_text.text_str().to_string();
    // collect the minimum and maximum byte positions, and then slice
    // the source text to only include the relevant lines
    let mut min_byte_pos = usize::MAX;
    let mut max_byte_pos = usize::MIN;

    let lines = TextLines::new(&source_text.text_str());
    let mut source = String::new();
    let mut highlights = vec![];

    for highlight in snippet.highlights {
      let range: SourceRange = highlight.range.into();
      let level: LintDiagnosticLevel = highlight.style.into();
      let tuple_range: (usize, usize) = range.clone().into();
      let (start, end) = tuple_range;

      min_byte_pos = min_byte_pos.min(start);
      max_byte_pos = max_byte_pos.max(end);

      highlights.push((range, level));
    }

    let start_line = lines.line_index(min_byte_pos);
    let end_line = lines.line_index(max_byte_pos);

    for line in start_line..=end_line {
      let line_text = source_text.line_text(line);
      source.push_str(line_text);
      source.push('\n');
    }

    let source_range = lines.line_start(start_line)..lines.line_end(end_line);
    let range: SourceRange = source_range.into();

    LintDiagnosticSnippet::new(source, range, highlights)
  }
}

#[derive(Debug, Clone, Constructor, Hash, PartialEq, Eq, PartialOrd, Ord, Default)]
pub struct LintDiagnostic {
  /// The file specifier that the diagnostic applies to.
  pub specifier: String,
  /// The range within the file that the diagnostic applies to.
  // #[serde(skip_serializing_if = "Option::is_none")]
  pub range: Option<LintDiagnosticRange>,
  /// The diagnostic level, which can be one of `error`, `warning`, or `hint`.
  pub level: LintDiagnosticLevel,
  /// The diagnostic code, which is a unique identifier for the rule that
  /// generated the diagnostic.
  pub code: String,
  /// The diagnostic message, which is a human-readable description of the diagnostic.
  pub message: String,
  /// An optional hint that can be displayed to the user to help them resolve the diagnostic.
  pub hint: Option<String>,
  /// An array of suggested fixes for the diagnostic.
  #[cfg(feature = "fix")]
  pub fixes: Vec<LintFix>,
  /// The tags associated with the diagnostic's rule, if any.
  pub tags: Vec<Cow<'static, str>>,
  /// An array of additional information about the diagnostic.
  pub info: Vec<Cow<'static, str>>,
  /// An optional snippet of the source code that caused the diagnostic.
  pub snippet: Option<LintDiagnosticSnippet>,
  /// An optional snippet of the source code with available fixes applied.
  #[cfg(feature = "fix")]
  pub snippet_fixed: Option<LintDiagnosticSnippet>,
  /// An optional URL to custom documentation for the diagnostic.
  pub docs_url: Option<String>,
  /// An optional pretty-printed version of the diagnostic's message.
  pub pretty: Option<String>,
}

#[rustfmt::skip]
impl Serialize for LintDiagnostic {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::Serializer,
  {
    // janky as hell but it works
    let mut len = 11usize;
    // adjust the size based on what fields are present
    if self.hint.is_none() { len -= 1; }
    if self.range.is_none() { len -= 1; }
    if self.snippet.is_none() { len -= 1; }
    #[cfg(feature = "fix")]
    if self.snippet_fixed.is_none() { len -= 1; }
    if self.docs_url.is_none() { len -= 1; }
    if self.pretty.is_none() { len -= 1; }
    if cfg!(not(feature = "fix")) { len -= 2; }

    let mut state = serializer.serialize_struct("LintDiagnostic", len)?;
    state.serialize_field("specifier", &self.specifier)?;

    if let Some(r) = &self.range {
      state.serialize_field("range", &r.range)?;
    }

    state.serialize_field("level", &self.level)?;
    state.serialize_field("tags", &self.tags)?;
    state.serialize_field("code", &intern(&self.code))?;
    state.serialize_field("message", &self.message)?;
    state.serialize_field("info", &self.info)?;

    if let Some(hint) = &self.hint {
      state.serialize_field("hint", hint)?;
    }
    if let Some(snippet) = &self.snippet {
      state.serialize_field("snippet", snippet)?;
    }
    #[cfg(feature = "fix")]
    state.serialize_field("fixes", &self.fixes)?;

    #[cfg(feature = "fix")]
    if let Some(snippet_fixed) = &self.snippet_fixed {
      state.serialize_field("snippetFixed", snippet_fixed)?;
    }
    if let Some(docs_url) = &self.docs_url {
      state.serialize_field("docs", docs_url)?;
    }
    if let Some(pretty) = &self.pretty {
      state.serialize_field("pretty", pretty)?;
    }

    state.end()
  }
}

impl From<DenoLintDiagnosticDetails> for LintDiagnostic {
  fn from(details: DenoLintDiagnosticDetails) -> Self {
    let mut diag: LintDiagnostic = Default::default();

    let custom_docs_url = match details.custom_docs_url.clone() {
      LintDocsUrl::None => None,
      LintDocsUrl::Default => Some(format!(
        "https://docs.deno.com/lint/rules/{}",
        details.code.clone()
      )),
      LintDocsUrl::Custom(url) => Some(url),
    };

    let code = details.code.clone();
    let code_str = static_str!(code.as_str());
    diag.tags = get_tags_for_rule(code_str.into());
    diag.message = details.message.clone();
    diag.code = details.code.clone();
    diag.hint = details.hint.clone();
    #[cfg(feature = "fix")]
    {
      diag.fixes = details
        .fixes
        .into_iter()
        .map(crate::fixes::LintFix::from)
        .collect();
    }
    diag.docs_url = custom_docs_url.clone();
    diag.info = details.info.clone();

    diag
  }
}

impl From<DenoLintDiagnostic> for LintDiagnostic {
  fn from(diagnostic: DenoLintDiagnostic) -> Self {
    let details = diagnostic.details.clone();
    let mut diag: LintDiagnostic = details.into();
    diag.level = diagnostic.level().into();
    diag.snippet = diagnostic.snippet().map(|s| s.into());
    if cfg!(feature = "fix") {
      diag.snippet_fixed = diagnostic.snippet_fixed().map(|s| s.into());
    }
    diag.docs_url = diagnostic.docs_url().map(|s| s.to_string());
    diag.specifier = diagnostic.specifier.clone().to_string();
    diag.range = diagnostic.range.clone().map(|r| {
      let text_info = r.text_info.clone();
      let text = text_info.text_str();
      let source = intern(text).to_string();
      let range = LintDiagnosticRange::new(source, r.range.into(), r.description);

      diag.snippet.as_mut().map(|s| {
        s.range.start = s.range.start.interpolate(text).into();
        s.range.end = s.range.end.interpolate(text).into();

        s.highlights.iter_mut().for_each(|(r, _)| {
          r.start = r.start.interpolate(text).into();
          r.end = r.end.interpolate(text).into();
        });
      });

      range
    });
    let display = diagnostic.display().to_string();
    let display_str = intern(&display);
    diag.pretty = Some(display_str.to_string());
    diag
  }
}

impl From<ParseDiagnostic> for LintDiagnostic {
  fn from(diagnostic: ParseDiagnostic) -> Self {
    let mut details: LintDiagnostic = Default::default();

    details.level = LintDiagnosticLevel::Error;
    details.range = Some(diagnostic.range.into());
    details.code = diagnostic.code().to_string();
    details.message = diagnostic.message().to_string();
    details.hint = diagnostic.hint().map(|s| s.to_string());
    details.snippet = diagnostic.snippet().map(|s| s.into());
    details.tags = vec![];
    details.info = vec![];
    details.docs_url = None;

    if cfg!(feature = "fix") {
      details.fixes = vec![];
      details.snippet_fixed = None;
    }

    details
  }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LintDiagnostics {
  pub specifier: String,
  #[serde(rename = "type")]
  pub media_type: String,
  pub text: String,
  pub config: LinterOptions,
  pub diagnostics: Vec<LintDiagnostic>,
  pub errors: Vec<LintDiagnostic>,
  #[cfg(feature = "fix")]
  pub fixes: Vec<LintFix>,
}

mod rules {
  use ::std::borrow::Cow;
  use ::std::collections::{HashMap, HashSet};
  use ::wasm_bindgen::intern;
  use ::wasm_bindgen::prelude::*;

  use super::*;

  /// Get all available rule codes.
  pub fn get_all_rule_codes() -> HashSet<Cow<'static, str>> {
    let mut rules: Vec<Cow<'static, str>> =
      get_all_rules().iter().map(|r| r.code().into()).collect();
    rules.sort();
    rules.into_iter().collect()
  }

  /// Get recommended rule codes.
  pub fn get_recommended_rule_codes() -> HashSet<&'static str> {
    let mut rules: Vec<&'static str> = recommended_rules(get_all_rules())
      .iter()
      .map(|r| r.code())
      .collect();
    rules.sort();
    rules.into_iter().collect()
  }

  /// Get the tags associated with an optional set of rules (defaults to all).
  pub fn get_tags(rules: Option<Vec<Box<dyn LintRule>>>) -> HashSet<Tag> {
    let mut tags: HashSet<Tag> = HashSet::new();
    for rule in rules.unwrap_or_else(get_all_rules) {
      for tag in rule.tags() {
        tags.insert(tag.into());
      }
    }
    // sort them for determinism
    let mut tags: Vec<Tag> = tags.into_iter().collect();
    tags.sort();
    tags.into_iter().collect()
  }

  /// Get the tags associated with a specific rule code.
  pub fn get_tags_for_rule(code: String) -> Vec<Cow<'static, str>> {
    let mut tags: Vec<Cow<'static, str>> = Vec::new();
    let all_rules = get_all_rules().into_iter().collect::<Vec<_>>();
    if let Some(rule) = all_rules.iter().find(|r| r.code() == code) {
      for tag in rule.tags() {
        tags.push(tag.display().into());
      }
    }
    tags.dedup();
    tags.sort();
    tags
  }

  /// Get all of the tags associated with the given rule codes. If no rules
  /// are provided, all available tags will be returned.
  #[wasm_bindgen(js_name = getTags)]
  pub fn get_tags_js(maybe_rules: Option<Vec<String>>) -> Vec<String> {
    let maybe_tags = if maybe_rules.is_some() {
      Some(vec![])
    } else {
      None
    };
    let rules = filtered_rules(get_all_rules(), maybe_tags, None, maybe_rules);
    let tags = get_tags(Some(rules));
    let mut tags: Vec<String> = tags.iter().map(|t| intern(t.0).to_string()).collect();
    tags.sort();
    tags
  }

  /// Get all available tags.
  #[wasm_bindgen(js_name = getAllTags)]
  pub fn get_all_tags_js() -> Vec<String> {
    get_tags_js(None)
  }

  /// Get the rule codes associated with the given filter options.
  ///
  /// @param {Array<string>} [maybe_tags] An array of rule tags to enable. If
  /// omitted, all rules will be included. If empty, no rules will be included.
  /// @param {Array<string>} [maybe_exclude] An array of rule codes to exclude.
  /// @param {Array<string>} [maybe_include] An array of rule codes to include.
  /// Takes priority over `maybe_exclude`.
  /// @returns {Array<string>} An array of rule codes.
  #[wasm_bindgen(js_name = getRules, skip_jsdoc)]
  pub fn get_rules_js(
    maybe_tags: Option<Vec<String>>,
    maybe_exclude: Option<Vec<String>>,
    maybe_include: Option<Vec<String>>,
  ) -> Vec<String> {
    let rules = filtered_rules(get_all_rules(), maybe_tags, maybe_exclude, maybe_include);
    let mut rules: Vec<String> = rules.iter().map(|r| intern(r.code()).to_string()).collect();
    rules.sort();
    rules
  }

  /// Get all available rule codes.
  #[wasm_bindgen(js_name = getAllRules)]
  pub fn get_all_rules_js() -> Vec<String> {
    get_rules_js(None, None, None)
  }

  /// Get the rule codes associated with the recommended tag.
  #[wasm_bindgen(js_name = getRecommendedRules)]
  pub fn get_recommended_rules_js() -> Vec<String> {
    let mut rules: Vec<String> = get_recommended_rule_codes()
      .iter()
      .map(|s| intern(s).to_string())
      .collect();
    rules.sort();
    rules
  }
}
pub use rules::*;

#[cfg(feature = "fix")]
mod fixes {
  use ::deno_ast::{TextChange, apply_text_changes};
  use ::serde::{Deserialize, Serialize};
  use ::serde_wasm_bindgen::from_value;
  use ::std::borrow::Cow;
  use ::wasm_bindgen::intern;
  use ::wasm_bindgen::prelude::*;

  #[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
  #[serde(rename_all = "camelCase")]
  pub struct LintFixChange {
    pub new_text: Cow<'static, str>,
    pub range: super::SourceRange,
  }

  impl From<::deno_lint::diagnostic::LintFixChange> for LintFixChange {
    fn from(change: ::deno_lint::diagnostic::LintFixChange) -> Self {
      let new_text = change.new_text;
      let range = crate::SourceRange::from(change.range);

      LintFixChange { new_text, range }
    }
  }

  impl From<LintFixChange> for TextChange {
    fn from(change: LintFixChange) -> Self {
      let new_text = change.new_text.to_string();
      let range: crate::SourceRange = change.range.clone();
      let start = range.start.byte_pos as usize;
      let end = range.end.byte_pos as usize;

      TextChange {
        new_text,
        range: start..end,
      }
    }
  }

  impl From<TextChange> for LintFixChange {
    fn from(change: TextChange) -> Self {
      let new_text = change.new_text.into();
      let range = super::SourceRange::from(change.range);

      LintFixChange { new_text, range }
    }
  }

  #[derive(Debug, Clone, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
  pub struct LintFix {
    pub description: Cow<'static, str>,
    pub changes: Vec<LintFixChange>,
  }

  impl From<::deno_lint::diagnostic::LintFix> for LintFix {
    fn from(fix: ::deno_lint::diagnostic::LintFix) -> Self {
      let description = fix.description;
      let changes = fix.changes.into_iter().map(LintFixChange::from).collect();

      LintFix {
        description,
        changes,
      }
    }
  }

  impl From<Vec<TextChange>> for LintFix {
    fn from(changes: Vec<TextChange>) -> Self {
      let description = "fix".into();
      let changes = changes.into_iter().map(LintFixChange::from).collect();

      LintFix {
        description,
        changes,
      }
    }
  }

  pub fn apply_fix_change(mut code: String, change: &LintFixChange) -> String {
    let range = change.range.clone();
    let new_text = change.new_text.clone();
    let start = range.start.byte_pos as usize;
    let end = range.end.byte_pos as usize;
    let len = code.len();
    if end < start || start >= len {
      panic!("Invalid range: {start}..{end} exceeds the bounds of [{start}, {len})");
    }
    code.replace_range(start..end, &new_text);
    code
  }

  /// Apply a fix to the given source code.
  pub fn apply_fix(source: impl ToString, fix: &LintFix) -> String {
    let mut code = source.to_string().clone();

    for change in &fix.changes {
      code = apply_fix_change(code, change);
    }
    code
  }

  #[wasm_bindgen(typescript_custom_section)]
  // this being indented is fine; deno fmt will fix it in the final file.
  const APPLY_FIX_JS_TYPES: &'static str = r#"
    /**
     * Represents a single change to a source code string.
     *
     * @category Types
     * @tags fix
     */
    export interface LintFixChange {
      /** The new text to replace the old text with. */
      newText: string;
      /** The range of the text to replace. */
      range: Range;
    }

    /**
     * Represents a fix to apply to a source code string.
     *
     * @category Types
     * @tags fix
     */
    export interface LintFix {
      /** A description of the fix. */
      description: string;
      /** An array of changes to apply. */
      changes: LintFixChange[];
    }

    /**
     * Applies a single {@linkcode LintFixChange} to the provided source code,
     * returning the transformed source code as a new string.
     *
     * If the change is out of range or fails to apply, an error is thrown.
     *
     * @param {string} source The source code to transform.
     * @param {LintFixChange} change The change to apply.
     * @returns {string} The transformed source code.
     * @throws {RangeError} If the change is out of range.
     * @throws {Error} If the change fails to apply.
     * @category Functions
     * @tags fix
     * @example Applying a change to a source code string:
     * ```ts
     * import * as dlint from "@nick/lint";
     *
     * const source = "window.alert(`Hello, world! Running on ${process.arch}`);\n";
     *
     * // window is no longer available in Deno 2.0
     * const { fixes } = dlint.lint(source, "example.ts", ["recommended"]);
     * const [fix] = fixes;
     * const [change] = fix.changes;
     * const fixed = dlint.applyFixChange(source, change);
     *
     * // updates window to globalThis, but does not fix the no-node-globals rule:
     * console.log(fixed);
     * // 'globalThis.alert(`Hello, world! Running on ${process.arch}`);\n'
     * ```
     */
    export function applyFixChange(source: string, change: LintFixChange): string;

    /**
     * Applies all of the changes from a given fix to a source code string,
     * returning the transformed source code as a new string.
     *
     * @param {string} source The source code to transform.
     * @param {LintFix} fix The fix to apply.
     * @returns {string} The transformed source code.
     * @category Functions
     * @tags fix
     * @example Applying a fix to a source code string:
     * ```ts
     * import * as dlint from "@nick/lint";
     *
     * // window is no longer available in Deno 2.0
     * const source = `window.alert("Hello, world!");\n`;
     *
     * const { fixes } = dlint.lint(source, "example.ts", ["recommended"]);
     * const [fix] = fixes;
     * const fixed = dlint.applyFix(source, fix);
     *
     * console.log(fixed);
     * // 'globalThis.alert("Hello, world!");\n'
     * ```
     */
    export function applyFix(source: string, fix: LintFix): string;

    /**
     * Applies the given fixes to a source code string, returning the transformed
     * source code as a new string. If any of the fixes fail to apply, an error
     * will be thrown.
     *
     * @param {string} source The source code to transform.
     * @param {LintFix[]} fixes An array of fixes to apply.
     * @returns {string} The transformed source code.
     * @category Functions
     * @tags fix
     * @example Applying multiple fixes to a source code string:
     * ```ts
     * import * as dlint from "@nick/lint";
     *
     * const source = "window.alert(`Hello, world! Running on ${process.arch}`);\n";
     *
     * // window is no longer available in Deno 2.0
     * // process is available (ish), but should be imported from "node:process"
     * const { fixes } = dlint.lint(source, "example.ts", ["recommended"]);
     *
     * const fixed = dlint.applyFixes(source, fixes);
     *
     * // inserts an import statement and updates window to globalThis:
     * console.log(fixed);
     * // 'import process from "node:process";\n' +
     * //   "globalThis.alert(`Hello, world! Running on ${process.arch}`);\n"
     * ```
     */
    export function applyFixes(source: string, fixes: LintFix[]): string;
  "#;

  /// Applies the given fix change to a source code string, returning the
  /// transformed source code as a new string. If the change is out of range or
  /// fails to apply, an error will be thrown.
  #[wasm_bindgen(js_name = applyFixChange, skip_typescript)]
  pub fn apply_fix_change_js(
    source: String,
    #[wasm_bindgen(unchecked_param_type = "LintFixChange")] change: JsValue,
  ) -> String {
    let src = source.clone();
    let change: LintFixChange = from_value(change.clone()).unwrap_throw();
    let changed = apply_fix_change(src, &change);
    intern(&changed);
    changed
  }

  /// Applies the given fix to a source code string, returning the transformed
  /// source code as a new string.
  #[wasm_bindgen(js_name = applyFix, skip_typescript)]
  pub fn apply_fix_js(
    source: String,
    #[wasm_bindgen(unchecked_param_type = "LintFix")] fix: JsValue,
  ) -> String {
    let src = source.clone();
    let fix: LintFix = from_value(fix.clone()).unwrap_throw();
    let fixed = apply_fix(src, &fix);
    intern(&fixed);
    fixed
  }

  /// Applies the given fixes to a source code string, returning the transformed
  /// source code as a new string. If any of the fixes fail to apply, an error
  /// will be thrown.
  #[wasm_bindgen(js_name = applyFixes, skip_typescript)]
  pub fn apply_fixes_js(
    source: String,
    #[wasm_bindgen(unchecked_param_type = "LintFix[]")] fixes: Vec<JsValue>,
  ) -> String {
    use core::cmp::Ordering;

    let mut src = source.clone();
    // sort fixes by range start position, applying them so that they don't
    // interfere with each other
    let mut fixes: Vec<LintFix> = fixes
      .into_iter()
      .map(|f| from_value(f).unwrap_throw())
      .collect();
    fixes.sort_by(|a, b| {
      if a.changes.is_empty() || b.changes.is_empty() {
        return Ordering::Equal;
      }
      // fast path for single change fixes
      if a.changes.len() == 1 && b.changes.len() == 1 {
        // we need to apply the fixes in reverse order. why, you ask?
        // fixes may introduce additional text that would break the range of
        // subsequent fixes. by applying them in reverse order, we ensure that
        // the range of each fix is still valid when the next fix is applied.
        let a_range = a.changes[0].range.clone();
        let b_range = b.changes[0].range.clone();
        return b_range
          .start
          .byte_pos
          .cmp(&a_range.start.byte_pos)
          .then(b_range.end.byte_pos.cmp(&a_range.end.byte_pos));
      }
      // for multi-change fixes, we need to sort by the overall range
      let a_range = a.changes.iter().fold(0..0, |acc, c| {
        let start = c.range.start.byte_pos as usize;
        let end = c.range.end.byte_pos as usize;
        acc.start.min(start)..acc.end.max(end)
      });
      let b_range = b.changes.iter().fold(0..0, |acc, c| {
        let start = c.range.start.byte_pos as usize;
        let end = c.range.end.byte_pos as usize;
        acc.start.min(start)..acc.end.max(end)
      });
      b_range
        .start
        .cmp(&a_range.start)
        .then(b_range.end.cmp(&a_range.end))
    });

    for fix in fixes {
      src = apply_fix(src, &fix);
    }
    src
  }
}

#[cfg(feature = "fix")]
pub use fixes::*;

/// Lints the given source code, returning an object with the following public
/// properties:
///
/// - `specifier` (string): The name of the file being linted.
/// - `media_type` (string): The media type of the file being linted.
/// - `text` (string): The source code being linted.
/// - `config` (LinterOptions): The linter configuration.
/// - `diagnostics` (Array<LintDiagnostic>): An array of lint diagnostics.
/// - `errors` (Array<LintDiagnostic>): An array of parse errors.
///
/// @param {string} code The source code to lint.
/// @param {string} [maybe_filename] The name of the file being linted.
/// @param {Array<string>} [maybe_tags] An array of rule tags to enable.
/// @param {Array<string>} [maybe_exclude] An array of rule codes to exclude.
/// @param {Array<string>} [maybe_include] An array of rule codes to include.
/// @param {string} [maybe_custom_ignore_file_directive] The custom ignore file directive.
/// @param {string} [maybe_custom_ignore_diagnostic_directive] The custom ignore diagnostic directive.
/// @returns {LintDiagnostics} The lint diagnostics and/or parse errors.
#[wasm_bindgen(skip_jsdoc)]
pub fn lint(
  code: String,
  maybe_filename: Option<String>,
  maybe_tags: Option<Vec<String>>,
  maybe_exclude: Option<Vec<String>>,
  maybe_include: Option<Vec<String>>,
  maybe_custom_ignore_file_directive: Option<String>,
  maybe_custom_ignore_diagnostic_directive: Option<String>,
  maybe_default_jsx_factory: Option<String>,
  maybe_default_jsx_fragment_factory: Option<String>,
) -> Result<JsValue, JsValue> {
  let maybe_custom_ignore_file_directive =
    maybe_custom_ignore_file_directive.map(|s| static_str!(s.as_str()));
  let maybe_custom_ignore_diagnostic_directive =
    maybe_custom_ignore_diagnostic_directive.map(|s| static_str!(s.as_str()));
  inner_lint(
    code,
    maybe_filename,
    maybe_tags,
    maybe_exclude,
    maybe_include,
    maybe_custom_ignore_file_directive,
    maybe_custom_ignore_diagnostic_directive,
    maybe_default_jsx_factory,
    maybe_default_jsx_fragment_factory,
  )
  .map(|d| to_value(&d).unwrap())
}

// Internal linting function that returns a `LintDiagnostics` object.
pub(crate) fn inner_lint(
  code: String,
  maybe_filename: Option<String>,
  maybe_tags: Option<Vec<String>>,
  maybe_exclude: Option<Vec<String>>,
  maybe_include: Option<Vec<String>>,
  maybe_custom_ignore_file_directive: Option<&'static str>,
  maybe_custom_ignore_diagnostic_directive: Option<&'static str>,
  maybe_default_jsx_factory: Option<String>,
  maybe_default_jsx_fragment_factory: Option<String>,
) -> Result<LintDiagnostics, JsValue> {
  let filename = maybe_filename.unwrap_or("untitled.tsx".to_string());
  let specifier = ModuleSpecifier::parse(&format!("file:///{filename}"))
    .map_err(|e| JsValue::from_str(&format!("Failed to parse specifier: {e:?}")))?;
  let media_type = MediaType::from_specifier(&specifier);

  let text_info = SourceTextInfo::new(code.as_str().into());
  let text = text_info.text().to_string();

  let custom_ignore_file_directive =
    Some(maybe_custom_ignore_file_directive.unwrap_or("deno-lint-ignore-file"))
      .map(|s| s.to_string());
  let custom_ignore_diagnostic_directive =
    Some(maybe_custom_ignore_diagnostic_directive.unwrap_or("deno-lint-ignore"))
      .map(|s| s.to_string());

  let options = LinterOptions {
    tags: maybe_tags.unwrap_or(vec!["recommended".to_string()]),
    exclude: maybe_exclude.unwrap_or(vec![]),
    include: maybe_include.unwrap_or(vec![]),
    custom_ignore_diagnostic_directive,
    custom_ignore_file_directive,
    default_jsx_factory: maybe_default_jsx_factory,
    default_jsx_fragment_factory: maybe_default_jsx_fragment_factory,
  };

  let config = options.clone();
  let linter = DenoLinter::new(options.into());

  let mut diagnostics: Vec<LintDiagnostic> = vec![];
  let mut errors: Vec<LintDiagnostic> = vec![];

  let params = ParseParams {
    specifier: specifier.clone(),
    media_type: media_type.clone(),
    text: (&*text.clone()).into(),
    scope_analysis: true,
    capture_tokens: true,
    maybe_syntax: Some(::deno_ast::get_syntax(media_type.clone())),
  };

  let parsed_source = parse_program(params).ok().unwrap();
  let results = linter.lint_with_ast(&parsed_source, config.clone().into(), None);

  // Collect parse diagnostics
  if parsed_source.diagnostics().len() > 0 {
    for diagnostic in parsed_source.diagnostics() {
      errors.push(diagnostic.clone().into());
    }
  }

  for result in results {
    diagnostics.push(result.into());
  }

  let specifier = specifier.to_string();
  let media_type = media_type.to_string();

  #[cfg(feature = "fix")]
  {
    let mut fixes: Vec<LintFix> = vec![];
    let mut n = 0;

    while n < diagnostics.len() {
      let diagnostic = &diagnostics[n];
      let mut m = 0;
      while m < diagnostic.fixes.len() {
        let fix = &diagnostic.fixes[m];
        fixes.push(fix.clone());
        m += 1;
      }
      n += 1;
    }

    return Ok(LintDiagnostics {
      specifier,
      media_type,
      text,
      config,
      diagnostics,
      errors,
      fixes,
    });
  }

  #[cfg(not(feature = "fix"))]
  Ok(LintDiagnostics {
    specifier,
    media_type,
    text,
    config,
    diagnostics,
    errors,
  })
}

/// External JS functions provided by our fs.js module.
#[cfg(feature = "fs")]
mod fs {
  use std::path::Path;

  use deno_ast::MediaType;
  use serde::{Deserialize, Serialize};
  use serde_wasm_bindgen::{from_value, to_value};
  use wasm_bindgen::intern;
  use wasm_bindgen::prelude::*;

  use super::*;

  /// Lints the given file specifier, returning a `LintDiagnostics` object.
  ///
  /// This function interfaces either with the local file system or a
  /// virtual (in-memory) implementation, depending on the runtime environment.
  ///
  /// @param {string} specifier The file specifier to lint.
  /// @param {Array<string>} [maybe_tags] An array of rule tags to enable.
  ///   If omitted, all rules will be included.
  /// @param {Array<string>} [maybe_exclude] An array of rule codes to exclude.
  /// @param {Array<string>} [maybe_include] An array of rule codes to include.
  ///  Takes priority over `maybe_exclude`.
  /// @param {string} [maybe_custom_ignore_file_directive] The custom ignore file directive.
  /// @param {string} [maybe_custom_ignore_diagnostic_directive] The custom ignore diagnostic directive.
  /// @param {string} [maybe_default_jsx_factory] The default JSX factory.
  /// @param {string} [maybe_default_jsx_fragment_factory] The default JSX fragment factory.
  /// @returns {LintDiagnostics} The lint diagnostics.
  #[cfg(feature = "fs")]
  #[wasm_bindgen(js_name = lintFile, skip_jsdoc)]
  pub fn lint_file(
    specifier: String,
    maybe_tags: Option<Vec<String>>,
    maybe_exclude: Option<Vec<String>>,
    maybe_include: Option<Vec<String>>,
    maybe_custom_ignore_file_directive: Option<String>,
    maybe_custom_ignore_diagnostic_directive: Option<String>,
    maybe_default_jsx_factory: Option<String>,
    maybe_default_jsx_fragment_factory: Option<String>,
  ) -> Result<JsValue, JsValue> {
    let maybe_custom_ignore_file_directive =
      maybe_custom_ignore_file_directive.map(|s| static_str!(s.as_str()));
    let maybe_custom_ignore_diagnostic_directive =
      maybe_custom_ignore_diagnostic_directive.map(|s| static_str!(s.as_str()));
    let code = WasmFs::read_text_file(&specifier).unwrap_throw();
    inner_lint(
      code,
      Some(specifier),
      maybe_tags,
      maybe_exclude,
      maybe_include,
      maybe_custom_ignore_file_directive,
      maybe_custom_ignore_diagnostic_directive,
      maybe_default_jsx_factory,
      maybe_default_jsx_fragment_factory,
    )
    .map(|d| to_value(&d).unwrap())
  }

  /// Lints all the given file specifiers, returning an array of `LintDiagnostic`
  /// objects (one for each file).
  ///
  /// This function interfaces either with the local file system or a
  /// virtual (in-memory) implementation, depending on the runtime environment.
  ///
  /// @param {Array<string>} specifiers An array of file specifiers to lint.
  /// @param {Array<string>} [maybe_tags] An array of rule tags to enable.
  /// @param {Array<string>} [maybe_exclude] An array of rule codes to exclude.
  /// @param {Array<string>} [maybe_include] An array of rule codes to include.
  /// @param {string} [maybe_custom_ignore_file_directive] The custom ignore file directive.
  /// @param {string} [maybe_custom_ignore_diagnostic_directive] The custom ignore diagnostic directive.
  /// @param {string} [maybe_default_jsx_factory] The default JSX factory.
  /// @param {string} [maybe_default_jsx_fragment_factory] The default JSX fragment factory.
  /// @returns {Array} An array of lint diagnostics.
  #[wasm_bindgen(js_name = lintFiles, skip_jsdoc)]
  pub fn lint_files(
    specifiers: Vec<String>,
    maybe_tags: Option<Vec<String>>,
    maybe_exclude: Option<Vec<String>>,
    maybe_include: Option<Vec<String>>,
    maybe_custom_ignore_file_directive: Option<String>,
    maybe_custom_ignore_diagnostic_directive: Option<String>,
    maybe_default_jsx_factory: Option<String>,
    maybe_default_jsx_fragment_factory: Option<String>,
  ) -> Result<JsValue, JsValue> {
    let maybe_custom_ignore_file_directive =
      maybe_custom_ignore_file_directive.map(|s| static_str!(s.as_str()));
    let maybe_custom_ignore_diagnostic_directive =
      maybe_custom_ignore_diagnostic_directive.map(|s| static_str!(s.as_str()));
    let mut diagnostics: Vec<LintDiagnostics> = vec![];

    for specifier in specifiers {
      let code = WasmFs::read_text_file(&specifier).unwrap_throw();
      let d = inner_lint(
        code,
        Some(specifier),
        maybe_tags.clone(),
        maybe_exclude.clone(),
        maybe_include.clone(),
        maybe_custom_ignore_file_directive.clone(),
        maybe_custom_ignore_diagnostic_directive.clone(),
        maybe_default_jsx_factory.clone(),
        maybe_default_jsx_fragment_factory.clone(),
      )
      .ok()
      .unwrap();
      diagnostics.push(d);
    }

    Ok(to_value(&diagnostics)?)
  }

  /// Lints the given directory, returning an array of `LintDiagnostics` objects,
  /// with one for each file in the directory. Symbolic links and subdirectories
  /// are ignored. The following extensions are linted by default:
  /// - `.js`
  /// - `.jsx`
  /// - `.ts`
  /// - `.tsx`
  /// - `.mjs`
  /// - `.cjs`
  ///
  /// This function interfaces either with the local file system or a virtual
  /// (in-memory) implementation, depending on the runtime environment.
  ///
  /// @param {string} directory The path to the directory to lint.
  /// @param {Array<string>} [maybe_exts] An array of file extensions to lint.
  /// Defaults to `[".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]`.
  /// @param {Array<string>} [maybe_tags] An array of rule tags to enable.
  /// @param {Array<string>} [maybe_exclude] An array of rule codes to exclude.
  /// @param {Array<string>} [maybe_include] An array of rule codes to include.
  /// @param {string} [maybe_custom_ignore_file_directive] The custom ignore file directive.
  /// @param {string} [maybe_custom_ignore_diagnostic_directive] The custom ignore diagnostic directive.
  /// @param {string} [maybe_default_jsx_factory] The default JSX factory.
  /// @param {string} [maybe_default_jsx_fragment_factory] The default JSX fragment factory.
  /// @returns {Array<LintDiagnostics>} An array of lint diagnostics.
  #[wasm_bindgen(js_name = lintFolder, skip_jsdoc)]
  pub fn lint_folder(
    directory: String,
    maybe_exts: Option<Vec<String>>,
    maybe_tags: Option<Vec<String>>,
    maybe_exclude: Option<Vec<String>>,
    maybe_include: Option<Vec<String>>,
    maybe_custom_ignore_file_directive: Option<String>,
    maybe_custom_ignore_diagnostic_directive: Option<String>,
    maybe_default_jsx_factory: Option<String>,
    maybe_default_jsx_fragment_factory: Option<String>,
  ) -> Result<JsValue, JsValue> {
    let maybe_custom_ignore_file_directive =
      maybe_custom_ignore_file_directive.map(|s| static_str!(s.as_str()));
    let maybe_custom_ignore_diagnostic_directive =
      maybe_custom_ignore_diagnostic_directive.map(|s| static_str!(s.as_str()));
    let exts = maybe_exts.unwrap_or_else(|| {
      vec![".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]
        .iter()
        .map(|s| s.to_string())
        .collect()
    });

    let mut diagnostics: Vec<LintDiagnostics> = vec![];
    let entries: Vec<WasmFsDirEntry> = WasmFs::read_dir(&directory).unwrap_throw();

    let mut n = 0;
    while n < entries.len() {
      let entry: WasmFsDirEntry = entries[n].clone();
      let path: String = entry.path.clone();
      let metadata = entry.metadata.clone();
      if metadata.is_file {
        let osext = Path::new(&path).extension().unwrap_or_default();
        let ext = osext.to_str().unwrap_or_default();
        let is_match = exts.contains(&ext.to_string())
          || exts.contains(&format!(
            ".{}",
            if ext.starts_with('.') { &ext[1..] } else { ext }
          ));

        if is_match {
          let res = WasmFs::read_text_file(&path.to_string());
          if res.is_err() {
            n += 1;
            continue;
          }
          let code = res.unwrap_throw();
          let d = inner_lint(
            code,
            Some(path.to_string()),
            maybe_tags.clone(),
            maybe_exclude.clone(),
            maybe_include.clone(),
            maybe_custom_ignore_file_directive.clone(),
            maybe_custom_ignore_diagnostic_directive.clone(),
            maybe_default_jsx_factory.clone(),
            maybe_default_jsx_fragment_factory.clone(),
          )
          .ok()
          .unwrap();

          diagnostics.push(d);
        }
      }
      n += 1;
    }

    Ok(to_value(&diagnostics)?)
  }

  #[wasm_bindgen(module = "/src/fs.js")]
  extern "C" {
    #[wasm_bindgen(catch)]
    pub(crate) fn stat_sync(path: &str) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch)]
    pub(crate) fn read_file(path: &str) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch)]
    pub(crate) fn read_to_string_lossy(path: &str) -> Result<String, JsValue>;

    #[wasm_bindgen(catch)]
    pub(crate) fn read_dir(path: &str) -> Result<JsValue, JsValue>;
  }

  /// Represents file metadata. All timing values are in milliseconds.
  #[derive(Debug, Default, Clone, Serialize, Deserialize)]
  pub(crate) struct WasmFsMetadata {
    pub is_file: bool,
    pub is_directory: bool,
    pub is_symlink: bool,
    pub size: Option<u32>,
    pub atime: Option<f64>,
    pub mtime: Option<f64>,
    pub ctime: Option<f64>,
    pub birthtime: Option<f64>,
    pub nlink: Option<u32>,
    pub uid: Option<u32>,
    pub gid: Option<u32>,
    pub mode: Option<u32>,
  }
  /// Represents a directory entry.
  #[derive(Debug, Clone, Serialize, Deserialize)]
  pub(crate) struct WasmFsDirEntry {
    pub name: String,
    pub path: String,
    #[serde(flatten)]
    pub metadata: WasmFsMetadata,
  }

  /// Represents an error returned from the filesystem.
  #[derive(Debug, Clone, Deserialize)]
  pub(crate) struct WasmFsError {
    pub message: String,
    pub code: Option<String>,
  }

  pub(crate) struct WasmFs;

  impl WasmFs {
    /// Returns the metadata for the file at `path`.
    #[allow(dead_code)]
    pub fn stat_sync(path: &str) -> Result<WasmFsMetadata, Error> {
      let js_val = stat_sync(path).map_err(map_err)?;
      from_value(js_val).map_err(map_serde_err)
    }

    #[allow(dead_code)]
    /// Reads the file at `path` and returns its raw contents as a JsValue.
    pub fn read_file(path: &str) -> Result<JsValue, Error> {
      read_file(path).map_err(map_err)
    }

    /// Reads the file at `path` and returns its contents as a UTF-8 string.
    pub fn read_text_file(path: &str) -> Result<String, Error> {
      read_to_string_lossy(path).map_err(map_err)
    }

    /// Reads the directory at `path` and returns a vector of directory entries.
    pub fn read_dir(path: &str) -> Result<Vec<WasmFsDirEntry>, Error> {
      let js_val = read_dir(path).map_err(map_err)?;
      from_value(js_val).map_err(map_serde_err)
    }
  }

  fn map_err(err: JsValue) -> Error {
    let error: WasmFsError = from_value(err).unwrap();
    let kind = match error.code {
      Some(code) => match code.as_str() {
        "ENOENT" => ErrorKind::NotFound,
        "EEXIST" => ErrorKind::AlreadyExists,
        "EACCES" => ErrorKind::PermissionDenied,
        "EISDIR" => ErrorKind::IsADirectory,
        "ENOTDIR" => ErrorKind::NotADirectory,
        "ELOOP" => ErrorKind::FilesystemLoop,
        "ENOSPC" => ErrorKind::StorageFull,
        "EROFS" => ErrorKind::ReadOnlyFilesystem,
        "EPERM" => ErrorKind::PermissionDenied,
        "EINVAL" => ErrorKind::InvalidInput,
        "ENOTEMPTY" => ErrorKind::DirectoryNotEmpty,
        _ => ErrorKind::Other,
      },
      None => ErrorKind::Other,
    };
    Error::new(kind, error.message)
  }

  fn map_serde_err(err: serde_wasm_bindgen::Error) -> Error {
    Error::new(ErrorKind::Other, err.to_string())
  }
}

#[cfg(feature = "fs")]
pub use fs::*;

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_wasm_diagnostic_level_conversions() {
    let level1: LintDiagnosticLevel = 1.into();
    assert_eq!(level1, LintDiagnosticLevel::Warning);

    #[allow(unused_variables)]
    let level2: DenoDiagnosticLevel = LintDiagnosticLevel::Warning.into();
    assert_eq!(stringify!(level2), "Warning");

    let level3: LintDiagnosticLevel = DenoDiagnosticSnippetHighlightStyle::Warning.into();
    assert_eq!(level3, LintDiagnosticLevel::Warning);

    #[allow(unused_variables)]
    let level4: DenoDiagnosticSnippetHighlightStyle = LintDiagnosticLevel::Warning.into();
    assert_eq!(stringify!(level4), "Warning");
  }
}
