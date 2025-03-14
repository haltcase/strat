import { strat } from "../src/index.ts";
import { assertEquals, assertThrows } from "jsr:@std/assert";

Deno.test("interpolates positional arguments", () => {
	const template = "{0}, you have {1} unread message{2}";
	const expected = "Holly, you have 2 unread messages";
	const result = strat(template, ["Holly", 2, "s"]);

	assertEquals(result, expected);
});

Deno.test("strips unmatched placeholders", () => {
	const template = "{0}, you have {1} unread message{2}";
	const expected = "Steve, you have 1 unread message";
	const result = strat(template, ["Steve", 1]);

	assertEquals(result, expected);
});

Deno.test("allows sequential indices to be omitted", () => {
	const template = "{}, you have {} unread message{}";
	const expected = "Steve, you have 1 unread message";
	const result = strat(template, ["Steve", 1]);

	assertEquals(result, expected);
});

Deno.test(
	"returns a partially applied function when given only a template",
	() => {
		const expected = "step into my parlor, said the spider to the fly";
		const result = strat("step into my {}, said the {} to the {}");

		assertEquals(typeof result, "function");
		assertEquals(result(["parlor", "spider", "fly"]), expected);
	},
);

Deno.test(
	`partially applied functions contain their template as a 'raw' property`,
	() => {
		const partial = strat(`it's {} noon`);
		assertEquals(partial.raw, `it's {} noon`);
	},
);

Deno.test("replaces all occurrences of a placeholder", () => {
	const template = "the meaning of life is {0} ({1} x {2} is also {0})";
	const expected = "the meaning of life is 42 (6 x 7 is also 42)";
	const result = strat(template, [42, 6, 7]);

	assertEquals(result, expected);
});

Deno.test("throws when implicit & explicit parameters are mixed", () => {
	assertThrows(() => strat("{} {0}", ["foo", "bar"]), Error, "implicit");
});

Deno.test("allows passing a lone non-Array replacement value", () => {
	const result = strat("{}", 1);
	assertEquals(result, "1");
});

Deno.test(`treats "{{" and "}}" as "{" and "}"`, () => {
	const template = '{{ {}: "{}" }}';
	const expected = '{ foo: "bar" }';
	const result = strat(template, ["foo", "bar"]);

	assertEquals(result, expected);
});

Deno.test("supports property access via dot notation", () => {
	const rick = { first: "Rick", last: "Sanchez" };
	const morty = { first: "Morty", last: "Smith" };

	const template = "{0.first} {0.last} and {1.first} {1.last}";
	const expected = "Rick Sanchez and Morty Smith";
	const result = strat(template, [rick, morty]);

	assertEquals(result, expected);
});

Deno.test("allows property shorthand for the first positional argument", () => {
	const rick = {
		first: "Rick",
		catchphrase: "Wubba lubba dub dub",
	};

	const template = `I'm tiny {first}! {catchphrase}!`;
	const expected = `I'm tiny Rick! Wubba lubba dub dub!`;
	const result = strat(template, [rick]);

	assertEquals(result, expected);
});

Deno.test(`maintains basic semantic compatibility with Python's API`, () => {
	assertEquals(strat("", ""), "");
	assertEquals(strat("abc", ""), "abc");
	assertEquals(strat("{0}", "abc"), "abc");
	assertEquals(strat("X {0}", "abc"), "X abc");
	assertEquals(strat("{0} X", "abc"), "abc X");
	assertEquals(strat("X {0} Y", "abc"), "X abc Y");
	assertEquals(strat("{1}", [1, "abc"]), "abc");
	assertEquals(strat("X {1}", [1, "abc"]), "X abc");
	assertEquals(strat("{1} X", [1, "abc"]), "abc X");
	assertEquals(strat("X {1} Y", [1, "abc"]), "X abc Y");
	assertEquals(strat("{0}", -15), "-15");
	assertEquals(strat("{0} {1}", [-15, "abc"]), "-15 abc");
	assertEquals(strat("{0} X {1}", [-15, "abc"]), "-15 X abc");
	assertEquals(strat("{{", ""), "{");
	assertEquals(strat("}}", ""), "}");
	assertEquals(strat("{{}}", ""), "{}");
	assertEquals(strat("{{x}}", ""), "{x}");
	assertEquals(strat("{{{0}}}", 123), "{123}");
	assertEquals(strat("{{{{0}}}}", ""), "{{0}}");
	assertEquals(strat("}}{{", ""), "}{");
	assertEquals(strat("}}x{{", ""), "}x{");
});
