export class ImplicitExplicitMixError extends Error {
	override message = "Cannot mix implicit & explicit formatting";
}

export class MissingTransformerError extends Error {
	constructor(transformerName: string) {
		super();
		this.message = `No transformer named '${transformerName}'`;
	}
}
