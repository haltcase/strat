import { placeholderRegex } from "./constants.ts";
import { ImplicitExplicitMixError, MissingTransformerError } from "./errors.ts";
import { getReplacement } from "./util.ts";

export const referenceKind: Record<
	"undefined" | "explicit" | "implicit",
	symbol
> = {
	undefined: Symbol("undefined"),
	explicit: Symbol("explicit"),
	implicit: Symbol("implicit"),
};

/**
 * Function that can be specified by name within a template string to transform
 * the value it modifies.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * const format = create({
 * 	uppercase: (value) => String(value).toUpperCase()
 * });
 *
 * const result = format("{text!uppercase}", { text: "i was lowercase" });
 * assertEquals(result, "I WAS LOWERCASE");
 * ```
 */
export type Transformer = (
	// we use `never` here because it allows the user to specify types for their
	// transformers that override it (unlike with `unknown`) but get compiler
	// errors if they try to use the parameter without a type annotation
	// (unlike with `any`) or type guards
	value: never,
	key: string,
	collection: never[],
) => string;

/**
 * Dictionary of {@link Transformer} functions.
 */
export type TransformerMap = Record<string, Transformer>;

export interface FormatPartial<T extends string> {
	/**
	 * A partially applied format function which can be called with
	 * replacements to populate placeholders.
	 *
	 * @param template - Template string with placeholders
	 */
	(replacements: unknown): string;

	/**
	 * The original template string for this partial format function.
	 */
	raw: T;
}

export interface StratFactoryResult {
	/**
	 * Create a partially applied format function which can later be called with
	 * replacements to populate placeholders.
	 *
	 * @example
	 * ```ts
	 * import { assertEquals } from "jsr:@std/assert/equals";
	 *
	 * const template = strat("My favorite color is {0}");
	 * assertEquals(template("blue"), "My favorite color is blue");
	 * ```
	 *
	 * @param template - Template string with placeholders
	 */
	<TInnerTemplate extends string>(
		template: TInnerTemplate,
	): FormatPartial<TInnerTemplate>;

	/**
	 * Create a partially applied format function which can later be called with
	 * replacements to populate placeholders.
	 *
	 * @example
	 * ```ts
	 * import { assertEquals } from "jsr:@std/assert/equals";
	 *
	 * const template = strat("My favorite color is {0}");
	 * assertEquals(template("blue"), "My favorite color is blue");
	 * ```
	 *
	 * @param template - Template string with placeholders
	 */
	<TInnerTemplate extends string>(
		template: TInnerTemplate,
		replacements: null | undefined,
	): FormatPartial<TInnerTemplate>;

	/**
	 * Apply the given {@link replacements} to the {@link template} string,
	 * return a string with the placeholders populated.
	 *
	 * @example
	 * ```ts
	 * import { assertEquals } from "jsr:@std/assert/equals";
	 *
	 * const result = strat("My favorite color is {0}", "blue");
	 * assertEquals(result, "My favorite color is blue");
	 * ```
	 *
	 * @param template - Template string with placeholders
	 */
	<TInnerTemplate extends string>(
		template: TInnerTemplate,
		// deno-lint-ignore ban-types
		replacements: {},
	): string;

	/**
	 * Apply the given {@link replacements} to the {@link template} string,
	 * return a string with the placeholders populated.
	 *
	 * @example
	 * ```ts
	 * import { assertEquals } from "jsr:@std/assert/equals";
	 *
	 * const result = strat("My favorite color is {0}", "blue");
	 * assertEquals(result, "My favorite color is blue");
	 * ```
	 *
	 * @param template - Template string with placeholders
	 */
	<TInnerTemplate extends string>(
		template: TInnerTemplate,
		replacements?: unknown,
	): string | FormatPartial<TInnerTemplate>;
}

/**
 * Create an isolated instance of the {@link strat} format function, within
 * which the template strings can use the given {@link transformers}.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * const format = create({
 * 	exclaim: (value) => `${value}!`
 * });
 *
 * assertEquals(format("{!exclaim}", "hello"), "hello!");
 * ```
 *
 * @param transformers - {@link TransformerMap|Set of transformers} for the instance
 * @returns Isolated format function instance
 */
export const create = <TTemplate extends string>(
	transformers: TransformerMap = {},
): StratFactoryResult => {
	const format = ((
		template,
		replacements,
	) => {
		if (replacements == null) {
			// deno-lint-ignore ban-types
			const partial = (appliedReplacements: {}) =>
				format(template, appliedReplacements);

			return Object.defineProperty(partial, "raw", {
				configurable: false,
				enumerable: true,
				get: () => template,
			}) as FormatPartial<typeof template>;
		}

		const replacementList = Array.isArray(replacements)
			? replacements
			: [replacements];

		let index = 0;
		let previousReferenceKind = referenceKind.undefined;

		return template.replace(
			placeholderRegex,
			(_match, escapedBrace, keyPath, transformerName) => {
				if (escapedBrace != null) {
					return escapedBrace;
				}

				if (keyPath) {
					if (previousReferenceKind === referenceKind.implicit) {
						throw new ImplicitExplicitMixError();
					}

					previousReferenceKind = referenceKind.explicit;
				} else {
					if (previousReferenceKind === referenceKind.explicit) {
						throw new ImplicitExplicitMixError();
					}

					previousReferenceKind = referenceKind.implicit;
					keyPath = String(index);
					index += 1;
				}

				const value = getReplacement(replacementList, keyPath.split(".")) ?? "";

				if (transformerName == null) {
					return value;
				} else if (Object.hasOwn(transformers, transformerName)) {
					return transformers[transformerName](
						// because we used `never` as the parameter type, we need these
						// casts in order to call the function without type errors
						value as never,
						keyPath,
						replacementList as never[],
					);
				} else {
					throw new MissingTransformerError(transformerName);
				}
			},
		);
	}) as StratFactoryResult;

	return format;
};

/**
 * Format the given `template` string with the given `replacements`, or return
 * a partially applied format function if `replacements` is missing or
 * `null | undefined`.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert/equals";
 *
 * const result = strat("My favorite color is {0}", "blue");
 * assertEquals(result, "My favorite color is blue");
 *
 * const template = strat("My favorite color is {0}");
 * assertEquals(template("blue"), "My favorite color is blue");
 * ```
 *
 * @param template - Template string with placeholders
 */
export const strat: ReturnType<typeof create> = create();
