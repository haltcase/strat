import { create, type FormatPartial, strat } from "../src/index.ts";

export const single = strat("{}", "hi");
export const multiple = strat("{}", ["hi", "again"]);

export const template1 = strat("{} + {} = happiness");
export const res1 = template1(["typescript", "strat"]);
// @ts-expect-error fails when no arguments provided
export const res2 = template1();
export const res3 = template1(null);
export const res4 = template1(undefined);

export const template2 = strat("{}", null) satisfies FormatPartial<"{}">;
export const template3 = strat("{}", undefined) satisfies FormatPartial<"{}">;

export const format = create({
	upper: (v: string) => v.toUpperCase(),
	// @ts-expect-error fails without a type annotation
	lower: (v) => v.toLowerCase(),
	number: (v: number) => String(v),
});

// strat.extend(String.prototype);

// declare global {
// 	interface String {
// 		format(replacements: any): string;
// 	}
// }

// export const str1 = "{}".format("hello");
export const str2 = format("{!upper}", "hello");
