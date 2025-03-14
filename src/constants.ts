export const placeholderRegex =
	/(?<escapedBrace>[{}])\1|[{](?<keyPath>.*?)(?:!(?<transformerName>.+?))?[}]/g;

export const isNumericRegex = /^\d+$/;

export const commaSpaceRegex = /,\s*/g;

export const invocationRegex =
	/^(?<functionName>[^\s]+)(?:\s+(?<parameterList>.+))?/;
