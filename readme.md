# strat &middot; ![JSR Version](https://img.shields.io/jsr/v/haltcase/strat?style=flat-square) [![npm](https://img.shields.io/npm/v/strat.svg?style=flat-square)](https://www.npmjs.com/package/strat) [![License](https://img.shields.io/npm/l/strat.svg?style=flat-square)](https://www.npmjs.com/package/strat)

_strat_ is a modern, dependency-free TypeScript library for formatting strings
in Deno and Node.js. It's inspired by Python's [`str.format()`][pythonref] but
is focused more on being at home in TypeScript than strictly adhering to
Python's conventions.

> If you want stricter Python conventions, check out
> [string-format][string-format] which served inspired the original version of
> this project.

## features

- formatting can be partially applied, allowing for reusable template functions
- object property references with dot notation
- object methods are called and can be passed arguments
- TypeScript-friendly for Deno and Node.js

## installation

### deno

Import and use:

```ts
import { strat } from "jsr:@haltcase/strat";
import type { FormatPartial, Transformer /*...*/ } from "jsr:@haltcase/strat";
```

### node

1. Install with your method of choice

   ```shell
   pnpm add strat
   npm install strat
   yarn add strat
   bun add strat
   ```

2. Import

   ```ts ignore
   import { strat } from "strat";
   ```

## usage

### view from the top

```ts ignore
const series = {
	title: "Arcane",
	seasons: 2,
	rottenTomatoesRating: 100,
};

strat("{title} ({rottenTomatoesRating}%) had {seasons} great seasons", series);
// -> "Arcane (100%) had 2 great seasons."
```

Compare that to the equivalent string concatenation in ES5:

```ts ignore
series.title + " (" + series.rottenTomatoesRating + "%) had " + series.seasons +
	" great seasons.";
```

Or the more modern template literals from ES2015:

```ts ignore
`${series.title} (${series.rottenTomatoesRating}%) had ${series.seasons} great seasons.`;
```

But the _strat_ function can also be partially applied to create reusable
template functions. Just leave out the initial replacements like so:

```ts ignore
const template = strat(
	"{title} ({rottenTomatoesRating}%) had {seasons} great seasons",
);

template(madMen);
// -> "Mad Men (94%) had 7 great seasons."
template(haltAndCatchFire);
// -> "Halt and Catch Fire (90%) had 4 great seasons."
template(peakyBlinders);
// -> "Peaky Blinders (93%) had 6 great seasons."
```

### partial application

When you omit the `replacements`, `strat` returns a partially applied, reusable
instance.

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

const result1 = strat("You got- you gotta run {}.", "Morty");
assertEquals(result1, "You got- you gotta run Morty.");

const result2 = strat("When you come to a {} in the road, {}.", [
	"fork",
	"take it",
]);
assertEquals(result2, "When you come to a fork in the road, take it.");
```

Here, the first argument is your template string. The second argument is an
array of replacement values, or just a single value.

The second argument can optionally be left out, in which case a new function
will be returned that you can call with your replacement parameters.

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

const template = strat("Like {} and {}");

assertEquals(template(["salt", "pepper"]), "Like salt and pepper");

assertEquals(
	template(["peanut butter", "jelly"]),
	"Like peanut butter and jelly",
);
```

### api

#### `strat(template: string, replacements: any | [...values]): string`

Returns the result of replacing each `{…}` placeholder in the template string
with its corresponding replacement.

Placeholders may contain numbers which refer to positional arguments:

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

assertEquals(
	strat("{0}, you have {1} unread message{2}", ["Holly", 2, "s"]),
	"Holly, you have 2 unread messages",
);
```

Unmatched placeholders produce no output:

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

assertEquals(
	strat("{0}, you have {1} unread message{2}", ["Steve", 1]),
	"Steve, you have 1 unread message",
);
```

A format string may reference a positional argument multiple times:

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

assertEquals(
	strat(`The name's {1}. {0} {1}.`, ["James", "Bond"]),
	"The name's Bond. James Bond.",
);
```

Positional arguments may be referenced implicitly:

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

assertEquals(
	strat("{}, you have {} unread message{}", ["Steve", 1]),
	"Steve, you have 1 unread message",
);
```

A format string must not contain both implicit and explicit references:

```ts ignore
strat("My name is {} {}. Do you like the name {0}?", ["Lemony", "Snicket"]);
// -> Error: cannot mix implicit & explicit formatting
```

Escape `{` and `}` characters by doubling it ( ie. `{{` and `}}` produce `{` and
`}` respectively ):

```ts ignore
strat("{{}} creates an empty {} {}", ["object", "literal"]);
// -> "{} creates an empty object literal"
```

Dot notation may be used to reference object properties:

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

const rick = { firstName: "Rick", lastName: "Sanchez" };
const morty = { firstName: "Morty", lastName: "Smith" };

assertEquals(
	strat("{0.firstName} {0.lastName} and {1.firstName} {1.lastName}", [
		rick,
		morty,
	]),
	"Rick Sanchez and Morty Smith",
);
```

`0.` may be omitted when referencing a property of `{0}`:

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

const song = {
	title: "Handlebars",
	artist: "Flobots",
	album: "Fight With Tools",
};

assertEquals(
	strat("{title} | [{artist}] | {album}", song),
	"Handlebars | [Flobots] | Fight With Tools",
);
```

If the referenced property is a method, it is invoked with no arguments to
determine the replacement:

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

const album = {
	name: "The Death of Peace of Mind",
	artist: "Bad Omens",
	releaseDate: new Date("2022-02-25"),
};

assertEquals(
	strat("{name} was released {releaseDate.toISOString}.", album),
	"The Death of Peace of Mind was released 2022-02-25T00:00:00.000Z.",
);

assertEquals(
	strat("Listen to more from {artist.toUpperCase}", album),
	"BAD OMENS",
);
```

To pass arguments to a method, pass them as a comma delimited list, with a space
after the method name:

```ts
import { strat } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

const person = {
	react(tired: string, mood: string) {
		if (tired) {
			if (mood === "sad") return "cried";
			return "rolled his eyes";
		} else {
			if (mood === "mad") return "broke stuff";
			return "shook his fist";
		}
	},
};

assertEquals(
	strat("Average Joe {react true, indifferent}.", person),
	"Average Joe rolled his eyes.",
);
```

Note that all arguments are passed as strings, so you'll have to parse them
appropriately if you need, for example, a number or boolean.

However, you can use `_` to pass the falsy `null` value in the argument list:

```ts ignore
strat("Average Joe {react _, mad}.", person);
// -> "Average Joe broke stuff."
```

#### `strat.create(transformers?: { ...functions })`

You can create a new instance of _strat_ by calling `strat.create()`. You may
also optionally supply an object containing transformer functions that you can
use in `strat()` to modify string replacements.

Transformers are very similar to a function you'd pass to
[`Array#map()`][mdn-array-map]. They receive three arguments: the value on which
it's being used, the key, and the full collection of replacements provided to
the template.

```ts ignore
transform(value: string, key: string, collection: [...values]): string
```

To use a transformer, call it by prefixing it with `!` after the field name in
the template string. For example, `{reaction!exclaim}` where `exclaim` was
previously passed in the `transformers` object.

Here's a simple example operating only on the `value` argument:

```ts
import { create } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

const instance = create({
	exclaim: (value) => value.toUpperCase() + "!",
});

assertEquals(instance("Hello, {!exclaim}", "world"), "Hello, WORLD!");
```

And here's one that semi-intelligently pluralizes units:

```ts
import { create } from "jsr:@haltcase/strat";
import { assertEquals } from "jsr:@std/assert/equals";

type MiniUnitShape = {
	days: number;
	daysLabel: string;
};

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
```

## see also

- [`logger-neue`][logger-neue] &ndash; refined logging utility that utilizes
  _strat_

## development

_strat_ is built with Deno and cross-published to npm for Node.js.

1. Clone the repo: `git clone https://github.com/haltcase/strat.git`
2. Move into the new directory: `cd strat`
3. Install dependencies: `deno install`
4. Run tests: `deno test`
5. Check code quality (lint, format, types): `deno run qc`
6. Build for npm: `deno run build-npm`

## contributing

Pull requests and any [issues](https://github.com/haltcase/strat/issues) found
are always welcome.

1. Fork the project, and preferably create a branch named something like
   `feat-make-better`
2. Follow the development steps [above](#development) but using your forked repo
3. Modify the source files as needed
4. Make sure all tests continue to pass, and it never hurts to have more tests
5. Push & pull request! :tada:

## license

MIT © [Bo Lingen / haltcase](https://github.com/haltcase)

[string-format]: https://github.com/davidchambers/string-format
[pythonref]: http://docs.python.org/library/stdtypes.html#str.format
[mdn-array-map]: https://mdn.io/array/map
[logger-neue]: https://github.com/haltcase/logger-neue
