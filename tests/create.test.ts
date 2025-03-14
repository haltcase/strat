import { assertEquals, assertThrows } from "jsr:@std/assert";
import { create, strat } from "../src/index.ts";
import { MissingTransformerError } from "../src/errors.ts";

const pluralize = (value: number) => (value === 1 ? "" : "s");
const instance = create({ pluralize });

Deno.test("create() returns an instance with the given transformers", () => {
	const upperReverse = (value: string) =>
		value.split("").reverse().join("").toUpperCase();

	const expected =
		"gibberish -> SIHT YDAER NAC UOY FI SKCUB ETURHCS YTNEWT UOY EVIG LL'I";

	const instance = create({ upperReverse });
	const template = instance("gibberish -> {!upperReverse}");
	const result = template(
		"I'll give you twenty Schrute bucks if you can ready this",
	);

	assertEquals(result, expected);
});

Deno.test("applies transformers to explicit positional arguments", () => {
	const text = "{0}, you have {1} unread message{1!pluralize}";

	assertEquals(
		instance(text, ["Steve", 1]),
		"Steve, you have 1 unread message",
	);

	assertEquals(
		instance(text, ["Holly", 2]),
		"Holly, you have 2 unread messages",
	);
});

Deno.test("applies transformers to implicit positional arguments", () => {
	const text =
		"The Cure{!pluralize}, The Door{!pluralize}, The Smith{!pluralize}";

	assertEquals(instance(text, [1, 2, 3]), "The Cure, The Doors, The Smiths");
});

Deno.test(
	"applies transformers to properties of explicit positional arguments",
	() => {
		const text = '<a href="/inbox">view message{0.length!pluralize}</a>';
		const oneElementArray = ["one"];
		const twoElementArray = ["one", "two"];

		assertEquals(
			instance(text, [oneElementArray]),
			'<a href="/inbox">view message</a>',
		);

		assertEquals(
			instance(text, [twoElementArray]),
			'<a href="/inbox">view messages</a>',
		);
	},
);

Deno.test(
	"applies transformers to properties of implicit positional arguments",
	() => {
		const text = '<a href="/inbox">view message{length!pluralize}</a>';
		const oneElementArray = ["one"];
		const twoElementArray = ["one", "two"];

		assertEquals(
			instance(text, [oneElementArray]),
			'<a href="/inbox">view message</a>',
		);

		assertEquals(
			instance(text, [twoElementArray]),
			'<a href="/inbox">view messages</a>',
		);
	},
);

Deno.test("transformers receive arguments similar to forEach iteration", () => {
	type MiniUnitShape = { days: number; daysLabel: string };
	type NonLabelKeys = Exclude<keyof MiniUnitShape, `${string}Label`>;

	const instance = create({
		pluralize(_value, key, collection: MiniUnitShape[]) {
			const labelSuffix = "Label";

			const pluralUnit = key.slice(0, -labelSuffix.length) as NonLabelKeys;
			const singularUnit = pluralUnit.slice(0, -1);

			return collection[0][pluralUnit] === 1 ? singularUnit : pluralUnit;
		},
	});

	const template = instance("{days} {daysLabel!pluralize}");

	assertEquals(template({ days: 2, daysLabel: "days" }), "2 days");
	assertEquals(template({ days: 1, daysLabel: "days" }), "1 day");
});

Deno.test("throws if no such transformer is defined", () => {
	assertThrows(
		() => strat("foo-{!toInfinitelyLongUpperCaseString}-baz", "bar"),
		MissingTransformerError,
		"toInfinitelyLongUpperCaseString",
	);
});
