import format from '../index'
import test from 'ava'

let pluralize = num => num === 1 ? '' : 's'
let instance = format.create({ pluralize })

test('format.create() returns an instance with the given transformers', t => {
  let upperReverse = str => str.split('').reverse().join('').toUpperCase()
  let expected = 'gibberish -> ETARGNI UOY SIHT GNIDAER KCUL DOOG'

  let instance = format.create({ upperReverse })
  let template = instance('gibberish -> {!upperReverse}')
  let result = template('good luck reading this you ingrate')

  t.is(result, expected)
})

test('applies transformers to explicit positional arguments', t => {
  let text = '{0}, you have {1} unread message{1!pluralize}'
  t.is(instance(text, ['Steve', 1]), 'Steve, you have 1 unread message')
  t.is(instance(text, ['Holly', 2]), 'Holly, you have 2 unread messages')
})

test('applies transformers to implicit positional arguments', t => {
  let text = 'The Cure{!pluralize}, The Door{!pluralize}, The Smith{!pluralize}'
  t.is(instance(text, [1, 2, 3]), 'The Cure, The Doors, The Smiths')
})

test('applies transformers to properties of explicit positional arguments', t => {
  let text = '<a href="/inbox">view message{0.length!pluralize}</a>'
  t.is(instance(text, [new Array(1)]), '<a href="/inbox">view message</a>')
  t.is(instance(text, [new Array(2)]), '<a href="/inbox">view messages</a>')
})

test('applies transformers to properties of implicit positional arguments', t => {
  let text = '<a href="/inbox">view message{length!pluralize}</a>'
  t.is(instance(text, [new Array(1)]), '<a href="/inbox">view message</a>')
  t.is(instance(text, [new Array(2)]), '<a href="/inbox">view messages</a>')
})

test('throws if no such transformer is defined', t => {
  let error = t.throws(() => format('foo-{!toString}-baz', 'bar'), Error)
  t.is(error.message, `no transformer named 'toString'`)
})
