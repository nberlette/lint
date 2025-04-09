/**
 * The `tags` module exposes types and functions for working with diagnostic
 * tags, which are used to categorize multiple different lint rules together
 * based on a common theme. These tags can be used to enable/disable groups of
 * rules at once, which proves to be quite useful for configuring the linter.
 *
 * @module tags
 */
import { LintRule } from "./rule.ts";
import { Tag } from "./rules.generated.ts";
import type { EnumKey, Restable } from "./_internal.ts";

export { Tag };

type ToTagLike<T> = T extends readonly [] ? []
  : T extends readonly [infer A extends Tag, ...infer R]
    ? [A | `${A}` | EnumKey<A, typeof Tag>, ...ToTagLike<R>]
  : [];

/**
 * Represents a collection of diagnostic tags.
 *
 * @category Tags
 * @tags tags, collections
 */
export class Tags<const T extends readonly Tag[] = Tag[]> {
  #tags = new Set<T[number]>();

  constructor(tags: T | ToTagLike<T>);
  constructor(...tags: T | ToTagLike<T>);
  constructor(...tags: Restable<T | ToTagLike<T>>);
  constructor(...tags: Restable<T | ToTagLike<T>>) {
    for (let tag of tags.flat(0)) {
      if (typeof tag === "string") {
        if (tag in Tag) tag = Tag[tag as Tag.Key];
        if (Tag.is(tag)) this.add(tag);
      }
    }
  }

  get size(): T["length"] {
    return this.#tags.size;
  }

  has(tag: Tag.Like): tag is T[number] {
    return this.#tags.has(tag as T[number]);
  }

  add(tag: T[number]): this;
  add<U extends Tag>(tag: U): Tags<[...T, U]>;
  add<U extends Tag>(tag: T | U): Tags<[...T, U]> | this {
    this.#tags.add(tag as T[number]);
    return this;
  }

  delete(tag: Tag.Like): boolean {
    return this.#tags.delete(Tag.from(tag));
  }

  clear(): void {
    this.#tags.clear();
  }

  *rules(): IterableIterator<LintRule> {
    for (const tag of this.#tags) {
      yield* LintRule.fromTag(tag);
    }
  }

  *[Symbol.iterator](): IterableIterator<T[number]> {
    yield* this.#tags;
  }
}

// /**
//  * Returns an iterable iterator that yields all available diagnostic tags.
//  *
//  * @category Tags
//  */
// export function* allTags(): IterableIterator<Tag> {
//   return yield* wasm.getAllTags() as Iterable<Tag>;
// }

// /**
//  * Returns an iterable iterator that yields all available diagnostic tag names
//  * as string literals.
//  *
//  * @category Tags
//  */
// export function* allTagNames(): IterableIterator<string> {
//   return yield* wasm.getAllTags();
// }

// /**
//  * Returns an array of all available diagnostic tags.
//  *
//  * @category Tags
//  */
// export function getAllTags(): readonly Tag[] {
//   return [...allTags()];
// }

// /**
//  * Returns an array of all available diagnostic tag names as string literals.
//  *
//  * @category Tags
//  */
// export function getAllTagNames(): readonly string[] {
//   return [...allTagNames()];
// }

// /**
//  * Checks whether the given value is a valid diagnostic tag.
//  *
//  * @category Tags
//  */
// export function isTag(value: unknown): value is Tag {
//   if (typeof value !== "string") return false;
//   const tag = value.toLowerCase().trim() as Tag;
//   return getAllTags().includes(tag);
// }
