import { isNumericRegex } from "./constants.ts";
import { parseInvocation } from "./parsing.ts";

export const getReplacement = (
	replacements: unknown[],
	path: string[],
): unknown => {
	const withNumericPrefix = isNumericRegex.test(path[0])
		// explicit reference to an index
		? path
		// implicit reference to first element
		: ["0", ...path];

	// deno-lint-ignore no-explicit-any
	let result: any = replacements;

	for (const key of withNumericPrefix) {
		const { isInvocation, reference } = parseInvocation(result, key);

		result = isInvocation ? reference() : result[key];
	}

	return result as string;
};
