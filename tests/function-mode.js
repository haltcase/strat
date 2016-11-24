import format from '../index'
import test from 'ava'

let isObject = v => v === Object(v) && !Array.isArray(v)

test('format is a function with `create` and `extend` methods', t => {
  ;[
    typeof format,
    typeof format.create,
    typeof format.extend
  ].map(type => t.is(type, 'function'))
})

test('exposes error constants', t => {
  ;[
    isObject(format.errors),
    typeof format.errors.ERR_ARGS_ARRAY === 'string',
    typeof format.errors.ERR_NUMBERING_MIX === 'string'
  ].map(v => t.true(v))
})

test('interpolates positional arguments', t => {
  let template = '{0}, you have {1} unread message{2}'
  let expected = 'Holly, you have 2 unread messages'
  let result = format(template, ['Holly', 2, 's'])

  t.is(result, expected)
})

test('strips unmatched placeholders', t => {
  let template = '{0}, you have {1} unread message{2}'
  let expected = 'Steve, you have 1 unread message'
  let result = format(template, ['Steve', 1])

  t.is(result, expected)
})

test('allows sequential indices to be omitted', t => {
  let template = '{}, you have {} unread message{}'
  let expected = 'Steve, you have 1 unread message'
  let result = format(template, ['Steve', 1])

  t.is(result, expected)
})

test('returns a curried function when given only a template', t => {
  let expected = 'step into my parlor, said the spider to the fly'
  let result = format('step into my {}, said the {} to the {}')

  t.is(typeof result, 'function')
  t.is(result(['parlor', 'spider', 'fly']), expected)
})

test(`curried functions contain their template as a 'raw' property`, t => {
  let curried = format(`it's {} noon`)
  t.is(curried.raw, `it's {} noon`)
})

test('replaces all occurrences of a placeholder', t => {
  let template = 'the meaning of life is {0} ({1} x {2} is also {0})'
  let expected = 'the meaning of life is 42 (6 x 7 is also 42)'
  let result = format(template, [42, 6, 7])

  t.is(result, expected)
})

test('throws when implicit & explicit parameters are mixed', t => {
  let error = t.throws(() => format('{} {0}', ['foo', 'bar']), Error)
  t.is(error.message, format.errors.ERR_NUMBERING_MIX)
})

test('throws when not provided a replacement array', t => {
  let error = t.throws(() => format('', 1, 2), Error)
  t.is(error.message, format.errors.ERR_ARGS_ARRAY)
})

test('allows passing a lone non-Array replacement value', t => {
  let result = format('{}', 1)
  t.is(result, '1')
})

test('treats "{{" and "}}" as "{" and "}"', t => {
  let template = '{{ {}: "{}" }}'
  let expected = '{ foo: "bar" }'
  let result = format(template, ['foo', 'bar'])

  t.is(result, expected)
})

test('supports property access via dot notation', t => {
  let rick = { first: 'Rick', last: 'Sanchez' }
  let morty = { first: 'Morty', last: 'Smith' }

  let template = '{0.first} {0.last} and {1.first} {1.last}'
  let expected = 'Rick Sanchez and Morty Smith'
  let result = format(template, [rick, morty])

  t.is(result, expected)
})

test('allows property shorthand for the first positional argument', t => {
  let rick = {
    first: 'Rick',
    catchphrase: 'Wubba lubba dub dub'
  }

  let template = `I'm tiny {first}! {catchphrase}!`
  let expected = `I'm tiny Rick! Wubba lubba dub dub!`
  let result = format(template, [rick])

  t.is(result, expected)
})

test(`maintains basic semantic compatibility with Python's API`, t => {
  t.is(format('', ''), '')
  t.is(format('abc', ''), 'abc')
  t.is(format('{0}', 'abc'), 'abc')
  t.is(format('X {0}', 'abc'), 'X abc')
  t.is(format('{0} X', 'abc'), 'abc X')
  t.is(format('X {0} Y', 'abc'), 'X abc Y')
  t.is(format('{1}', [1, 'abc']), 'abc')
  t.is(format('X {1}', [1, 'abc']), 'X abc')
  t.is(format('{1} X', [1, 'abc']), 'abc X')
  t.is(format('X {1} Y', [1, 'abc']), 'X abc Y')
  t.is(format('{0}', -15), '-15')
  t.is(format('{0} {1}', [-15, 'abc']), '-15 abc')
  t.is(format('{0} X {1}', [-15, 'abc']), '-15 X abc')
  t.is(format('{{', ''), '{')
  t.is(format('}}', ''), '}')
  t.is(format('{{}}', ''), '{}')
  t.is(format('{{x}}', ''), '{x}')
  t.is(format('{{{0}}}', 123), '{123}')
  t.is(format('{{{{0}}}}', ''), '{{0}}')
  t.is(format('}}{{', ''), '}{')
  t.is(format('}}x{{', ''), '}x{')
})
