import { commaSpaceRegex, invocationRegex } from "./constants.ts";

const nullParameter = "_";
const escapedUnderscore = "__";

const transformParameters = (value: string): string | null => {
	if (value === nullParameter) {
		return null;
	}

	if (value === escapedUnderscore) {
		return "_";
	}

	return value;
};

type InvocationParseOk = {
	isInvocation: true;
	reference: () => string;
	functionName: string;
	parameters: (string | null)[];
};

type InvocationParseError = {
	isInvocation: false;
	reference?: undefined;
	functionName?: undefined;
	parameters?: undefined;
};

type InvocationParseResult = InvocationParseOk | InvocationParseError;

export const parseInvocation = (
	object: unknown,
	key: string,
): InvocationParseResult => {
	const { functionName, parameterList = "" } =
		key.match(invocationRegex)?.groups ?? {};

	// deno-lint-ignore no-explicit-any
	if (!functionName || typeof (object as any)[functionName] !== "function") {
		return {
			isInvocation: false,
		};
	}

	const parameters = parameterList
		.split(commaSpaceRegex)
		.map((value) => transformParameters(value));

	return {
		isInvocation: true,
		// deno-lint-ignore no-explicit-any
		reference: () => (object as any)[functionName].apply(object, parameters),
		functionName,
		parameters,
	};
};
