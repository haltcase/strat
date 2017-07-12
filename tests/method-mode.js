import strat from '../index'
import test from 'ava'

test('extends arbitrary objects with the `format` method', t => {
  const someObject = Object.create(null)
  const someFunction = function () {}

  t.is(typeof someObject.format, 'undefined')
  t.is(typeof someFunction.format, 'undefined')

  strat.extend(someObject)
  strat.extend(someFunction)

  t.is(typeof someObject.format, 'function')
  t.is(typeof someFunction.format, 'function')
})

test('extending `String.prototype` allows calls on arbitrary strings', t => {
  t.is(typeof String.prototype.format, 'undefined')
  strat.extend(String.prototype)
  t.is(typeof String.prototype.format, 'function')

  const expected = 'Prototypes need love too'
  const result = '{} need {} too'.format(['Prototypes', 'love'])

  t.is(result, expected)
})

test('allows partial application when called in method mode', t => {
  if (typeof String.prototype.format !== 'function') {
    strat.extend(String.prototype)
  }

  /**
   * Partial application is not _quite_ as useful here, since
   * the `format()` method is now available on all strings,
   * so you can just store the string itself as the template.
   */

  const expected = 'Prototypes need love too'
  const partial = '{} need {} too'.format()
  const result = partial(['Prototypes', 'love'])

  t.is(result, expected)
})
