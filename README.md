# strat [![NPM](https://img.shields.io/npm/v/strat.svg?style=flat-square)](https://www.npmjs.com/package/strat) [![License](https://img.shields.io/npm/l/strat.svg?style=flat-square)](https://www.npmjs.com/package/strat) [![Travis CI](https://img.shields.io/travis/citycide/strat.svg?style=flat-square)](https://travis-ci.org/citycide/strat) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)

_strat_ is a modern, dependency-free JavaScript library for formatting strings.
It takes inspiration from Python's [`str.format()`][pythonref] but is focused
more on being at home in ES2015+ JavaScript than strictly adhering to Python's
conventions.

If you want stricter Python conventions, check out [string-format][string-format],
on which this project was based.

**try it live** on [JS Bin](http://jsbin.com/tasezi/1/edit?js,console)

## features

- formatting is curried, allowing for reusable template functions
- reference object properties as replacement values
- object methods are called and can be given arguments

## installation

### node

1. Install

   ```console
   npm i strat
   ```

2. Import

   ```js
   import strat from 'strat'

   // commonjs / ES5
   const strat = require('strat')
   ```

### browser

Just drop this repo's `index.js` in as a script tag to expose the `strat` function:

```html
<script src="path/to/strat/index.js"></script>
<script>
strat('{} {}!', ['Hello', 'world'])
</script>
```

If you prefer a CDN, you can use [unpkg](https://unpkg.com):

```html
<script src="https://unpkg.com/strat"></script>
<!-- or, with a version: -->
<script src="https://unpkg.com/strat@1.0.0-alpha.1"></script>
```

_NOTE: strat requires an environment supporting ES2015 syntax like `let` and
arrow functions. For Node, this is Node v4.0 or greater. See [node.green](node.green)
for Node compatibility, or [compat-table](https://kangax.github.io/compat-table/es6/)
for other environments._

## usage

### view from the top

```js
strat('{name}, {ultimate}, {catchphrase}', hero)
// -> 'Reinhardt, Earthshatter, "Hammer DOWN!"'
```

Compare that to the equivalent string concatenation in ES5:

```js
hero.name + ', ' + hero.ultimate + ', "' + hero.catchphrase + '"'
```

Or the more modern template literals from ES2015:

```js
`${hero.name}, ${hero.ultimate}, "${hero.catchphrase}"`
```

But the _strat_ function is auto-curried so you can create reusable template functions:

```js
let template = strat('{name}, {ultimate}, {catchphrase}')

template(reinhardt)
// -> 'Reinhardt, Earthshatter, "Hammer DOWN!"'
template(tracer)
// -> 'Tracer, Pulse Bomb, "Cheers, love! The cavalry's here!"'
template(hanzo)
// -> 'Hanzo, Dragonstrike, "Let the dragon consume you!"'
```

### modes

_strat_ can actually be used in two modes:
- [function mode](#function-mode) _(recommended)_
- [method mode](#method-mode)

#### function mode

```js
strat('You got- you gotta run {}.', 'Morty')
// -> 'You got- you gotta run Morty.'

strat(`You really gotta {} these {}, right?`, ['love', 'examples'])
// -> 'You really gotta love these examples, right?'
```

This is the recommended and standard way to use _strat_. Here, the first
argument is your template string. The second argument is an Array of replacement
values, or just a single value.

The second argument can optionally be left out, in which case a new function
will be returned that you can call with your replacement parameters.

```js
let template = strat('Like {} and {}')
template(['salt', 'pepper'])
// -> 'Like salt and pepper'
template(['peanut butter', 'jelly'])
// -> 'Like peanut butter and jelly'
```

#### method mode

```js
'You got- you gotta run {}.'.format('Morty')
// -> 'You got- you gotta run Morty.'

`You really gotta {} these {}, right?`.format(['love', 'examples'])
// -> 'You really gotta love these examples, right?'
```

This mode is _not_ enabled by default. If you want to use it as
shown above, you must first use [`strat.extend`](#stratextendobject-object-transformers--functions-):

```js
strat.extend(String.prototype)
```

`strat(template, [...values])` and `template.format([...values])` can then
be used interchangeably.

> **Important Note**

> You should probably **not** use this unless you are developing an application.
> If you are developing a library this will affect end users who have no control
> over your extension of the built-in `String.prototype`.

### api

#### `strat(template: string, replacements: any | [...values]): string`

Returns the result of replacing each `{…}` placeholder in the template
string with its corresponding replacement.

Placeholders may contain numbers which refer to positional arguments:

```js
strat('{0}, you have {1} unread message{2}', ['Holly', 2, 's'])
// -> 'Holly, you have 2 unread messages'
```

Unmatched placeholders produce no output:

```js
strat('{0}, you have {1} unread message{2}', ['Steve', 1])
// -> 'Steve, you have 1 unread message'
```

A format string may reference a positional argument multiple times:

```js
strat(`The name's {1}. {0} {1}.`, ['James', 'Bond'])
// -> "The name's Bond. James Bond."
```

Positional arguments may be referenced implicitly:

```js
strat('{}, you have {} unread message{}', ['Steve', 1])
// -> 'Steve, you have 1 unread message'
```

A format string must not contain both implicit and explicit references:

```js
strat('My name is {} {}. Do you like the name {0}?', ['Lemony', 'Snicket'])
// -> Error: cannot mix implicit & explicit formatting
```

Escape `{` and `}` characters by doubling it ( ie. `{{` and `}}` produce `{` and `}` ):

```js
strat('{{}} creates an empty {} {}', ['object', 'literal'])
// -> '{} creates an empty object literal'
```

Dot notation may be used to reference object properties:

```js
let rick = { firstName: 'Rick', lastName: 'Sanchez' }
let morty = { firstName: 'Morty', lastName: 'Smith' }

strat('{0.firstName} {0.lastName} and {1.firstName} {1.lastName}', [rick, morty])
// -> 'Rick Sanchez and Morty Smith'
```

`0.` may be omitted when referencing a property of `{0}`:

```js
let song = {
  title: 'Handlebars',
  artist: 'Flobots',
  album: 'Fight With Tools'
}

strat('{title} | [{artist}] | {album}', song)
// -> 'Handlebars | [Flobots] | Fight With Tools'
```

If the referenced property is a method, it is invoked with no arguments to
determine the replacement:

```js
let reacher = {
  firstName:   'Jack',
  lastName:    'Reacher',
  dob:         new Date('1960-10-29'),
  fullName:    function () { return strat('{firstName} {lastName}', this) },
  movieSequel: function () { return strat('{fullName}: never go back', this) }
}

strat('{fullName} was born {dob.toISOString}.', reacher)
// -> 'Jack Reacher was born 1960-10-29T00:00:00.000Z.'
// ... you probably shouldn't know that by the way

strat('Definitely watch {movieSequel.toUpperCase}', reacher)
// -> 'Definitely watch JACK REACHER: NEVER GO BACK'
```

To pass arguments to a method, pass them as a comma delimited list, with
a space after the method name:

```js
let person = {
  react (tired, mood) {
    if (tired) {
      if (mood === 'sad') return 'cried'
      return 'rolled his eyes'
    } else {
      if (mood === 'mad') return 'broke stuff'
      return 'shook his fist'
    }
  }
}

strat('Average Joe {react true, indifferent}.', person)
// -> 'Average Joe rolled his eyes.'
```

Note that all arguments are passed as strings, so you'll need to parse them
as needed if you need, for example, a number  or boolean.

However, you can use `_` to pass the falsy `null` value in the argument list:

```js
strat('Average Joe {react _, mad}.', person)
// -> 'Average Joe broke stuff.'
```

#### `strat.create(transformers?: { ...functions })`

You can create a new instance of _strat_ by calling `strat.create()`. You may
also optionally supply an Object containing transformer functions that you can
use in `strat()` to modify string replacements.

Transformers are very similar to a function you'd pass to [`Array#map()`][mdn-array-map].
They receive three arguments: the value on which it's being used, the key, and the full
collection of replacements provided to the template.

```js
transform(value: string, key: string, collection: [...values]): string
```

To use a transformer, call it by prefixing it with `!` after the field name in
the template string. For example, `{reaction!exclaim}` where `exclaim` was
previously passed in the `transformers` object.

Here's a simple example operating only on the `value` argument:

```js
let instance = strat.create({
  exclaim: str => str.toUpperCase() + '!'
})

instance('Hello, {!exclaim}', 'world')
// -> 'Hello, WORLD!'
```

And here's one that uses all three arguments to intelligently pluralize units:

```js
let instance = strat.create({
  pluralize (str, key, col) {
    let unit = key.slice(0, -5)
    let singular = unit.slice(0, -1)
    return col[0][unit] === 1 ? singular : unit
  }
})

let template = instance('{days}{daysLabel!pluralize}')

template({ days: 1, daysLabel: 'days' }) // -> '1day'
template({ days: 2, daysLabel: 'days' }) // -> '2days'
```

See [`strat.extend`](#stratextendobject-object-transformers--functions-) for a more involved
example.

#### `strat.extend(object: Object, transformers?: { ...functions })`

> **Important Note**

> For most use cases it is recommended to use [function mode](#function-mode)
> instead, since extending built in prototypes is usually a bad idea.

This function can be used to extend any object (usually `String.prototype`) with
a `format` method. The second argument is optional, and is an object containing
transformer functions.

```js
strat.extend(String.prototype, {
  escape (str) {
    return str.replace(/[&<>"'`]/g, v => {
      return '&#' + v.charCodeAt(0) + ';'
    })
  }
})

let store = {
  name: 'Barnes & Noble',
  url: 'https://www.barnesandnoble.com/'
}

'<a href="{url!escape}">{name!escape}</a>'.format(store)
// -> '<a href="https://www.barnesandnoble.com/">Barnes &#38; Noble</a>'
```

### tests

```console
npm install
npm test
```

## contributing

Contributions are welcome! Feel free to open an issue if you run into
trouble, or submit pull requests for proposed changes.

All you need to do is clone the repo, make your changes, and submit
a PR. For large changes it helps to open an issue for discussion first.

## license

MIT © [Bo Lingen / citycide](https://github.com/citycide)

[string-format]: https://github.com/davidchambers/string-format
[pythonref]: http://docs.python.org/library/stdtypes.html#str.format
[mdn-array-map]: https://mdn.io/array/map
