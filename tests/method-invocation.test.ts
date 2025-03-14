import { strat } from "../src/index.ts";
import { assertEquals } from "jsr:@std/assert";

const methods = {
	echo: (value: string) => value,
	addFive: (value: string) => Number(value) + 5,
	xform(str: string, upper: string, reverse: string) {
		let output = str + " " + str;
		if (upper) output = output.toUpperCase();
		if (reverse) output = output.split("").reverse().join("");
		return output;
	},
	countNulls(...args: string[]) {
		return args.filter((it) => it === null).length;
	},
};

Deno.test("invokes methods taking no arguments", () => {
	assertEquals(strat("{0.toLowerCase}", ["TINY BOOM"]), "tiny boom");
	assertEquals(strat("{0.toUpperCase}", ["huge boom"]), "HUGE BOOM");
	assertEquals(strat("{0.getFullYear}", [new Date("13 Sep 1994")]), "1994");
	assertEquals(
		strat("{pop} {pop} {pop}", [["one", "two", "three"]]),
		"three two one",
	);
});

Deno.test("invokes methods and passes a single argument", () => {
	assertEquals(strat("{addFive 1}", methods), "6");
	assertEquals(strat("{addFive 2}", methods), "7");
	assertEquals(strat("{addFive 3}", methods), "8");
});

Deno.test("invokes methods and passes multiple arguments", () => {
	assertEquals(strat("{xform hi, true}", methods), "HI HI");
	assertEquals(strat("{xform hi, _, true}", methods), "ih ih");
	assertEquals(strat("{xform hi, true, true}", methods), "IH IH");
});

Deno.test("allows passing `_` to nullify an argument", () => {
	assertEquals(strat("{countNulls 1, 2, 3, 4, 5, 6}", methods), "0");
	assertEquals(strat("{countNulls 1, 2, 3, _, 5, 6}", methods), "1");
	assertEquals(strat("{countNulls _, 2, 3, _, 5, 6}", methods), "2");
	assertEquals(strat("{countNulls 1, _, 3, _, _, 6}", methods), "3");
	assertEquals(strat("{countNulls _, _, 3, _, 5, _}", methods), "4");
	assertEquals(strat("{countNulls _, _, _, 4, _, _}", methods), "5");
	assertEquals(strat("{countNulls _, _, _, _, _, _}", methods), "6");
});

Deno.test("treats `__` as an escaped `_`", () => {
	assertEquals(strat("{echo __}", methods), "_");
});
