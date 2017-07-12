import strat from '../index'
import test from 'ava'

const isObject = v => v === Object(v) && !Array.isArray(v)

test('strat is a function with `create` and `extend` methods', t => {
  ;[
    typeof strat,
    typeof strat.create,
    typeof strat.extend
  ].map(type => t.is(type, 'function'))
})

test('exposes error constants', t => {
  ;[
    isObject(strat.errors),
    typeof strat.errors.ERR_ARGS_ARRAY === 'string',
    typeof strat.errors.ERR_NUMBERING_MIX === 'string'
  ].map(v => t.true(v))
})

test('interpolates positional arguments', t => {
  const template = '{0}, you have {1} unread message{2}'
  const expected = 'Holly, you have 2 unread messages'
  const result = strat(template, ['Holly', 2, 's'])

  t.is(result, expected)
})

test('strips unmatched placeholders', t => {
  const template = '{0}, you have {1} unread message{2}'
  const expected = 'Steve, you have 1 unread message'
  const result = strat(template, ['Steve', 1])

  t.is(result, expected)
})

test('allows sequential indices to be omitted', t => {
  const template = '{}, you have {} unread message{}'
  const expected = 'Steve, you have 1 unread message'
  const result = strat(template, ['Steve', 1])

  t.is(result, expected)
})

test('returns a partially applied function when given only a template', t => {
  const expected = 'step into my parlor, said the spider to the fly'
  const result = strat('step into my {}, said the {} to the {}')

  t.is(typeof result, 'function')
  t.is(result(['parlor', 'spider', 'fly']), expected)
})

test(`partially applied functions contain their template as a 'raw' property`, t => {
  const partial = strat(`it's {} noon`)
  t.is(partial.raw, `it's {} noon`)
})

test('replaces all occurrences of a placeholder', t => {
  const template = 'the meaning of life is {0} ({1} x {2} is also {0})'
  const expected = 'the meaning of life is 42 (6 x 7 is also 42)'
  const result = strat(template, [42, 6, 7])

  t.is(result, expected)
})

test('# syntax repeats the parameter the given number of times', t => {
  const template = '{#5}'
  const expected = 'Buffalo Buffalo Buffalo Buffalo Buffalo '
  const result = strat(template, 'Buffalo ')

  t.is(result, expected)
})

test('throws when implicit & explicit parameters are mixed', t => {
  const error = t.throws(() => strat('{} {0}', ['foo', 'bar']), Error)
  t.is(error.message, strat.errors.ERR_NUMBERING_MIX)
})

test('throws when not provided a replacement array', t => {
  const error = t.throws(() => strat('', 1, 2), Error)
  t.is(error.message, strat.errors.ERR_ARGS_ARRAY)
})

test('allows passing a lone non-Array replacement value', t => {
  const result = strat('{}', 1)
  t.is(result, '1')
})

test('treats "{{" and "}}" as "{" and "}"', t => {
  const template = '{{ {}: "{}" }}'
  const expected = '{ foo: "bar" }'
  const result = strat(template, ['foo', 'bar'])

  t.is(result, expected)
})

test('supports property access via dot notation', t => {
  const rick = { first: 'Rick', last: 'Sanchez' }
  const morty = { first: 'Morty', last: 'Smith' }

  const template = '{0.first} {0.last} and {1.first} {1.last}'
  const expected = 'Rick Sanchez and Morty Smith'
  const result = strat(template, [rick, morty])

  t.is(result, expected)
})

test('allows property shorthand for the first positional argument', t => {
  const rick = {
    first: 'Rick',
    catchphrase: 'Wubba lubba dub dub'
  }

  const template = `I'm tiny {first}! {catchphrase}!`
  const expected = `I'm tiny Rick! Wubba lubba dub dub!`
  const result = strat(template, [rick])

  t.is(result, expected)
})

test(`maintains basic semantic compatibility with Python's API`, t => {
  t.is(strat('', ''), '')
  t.is(strat('abc', ''), 'abc')
  t.is(strat('{0}', 'abc'), 'abc')
  t.is(strat('X {0}', 'abc'), 'X abc')
  t.is(strat('{0} X', 'abc'), 'abc X')
  t.is(strat('X {0} Y', 'abc'), 'X abc Y')
  t.is(strat('{1}', [1, 'abc']), 'abc')
  t.is(strat('X {1}', [1, 'abc']), 'X abc')
  t.is(strat('{1} X', [1, 'abc']), 'abc X')
  t.is(strat('X {1} Y', [1, 'abc']), 'X abc Y')
  t.is(strat('{0}', -15), '-15')
  t.is(strat('{0} {1}', [-15, 'abc']), '-15 abc')
  t.is(strat('{0} X {1}', [-15, 'abc']), '-15 X abc')
  t.is(strat('{{', ''), '{')
  t.is(strat('}}', ''), '}')
  t.is(strat('{{}}', ''), '{}')
  t.is(strat('{{x}}', ''), '{x}')
  t.is(strat('{{{0}}}', 123), '{123}')
  t.is(strat('{{{{0}}}}', ''), '{{0}}')
  t.is(strat('}}{{', ''), '}{')
  t.is(strat('}}x{{', ''), '}x{')
})
