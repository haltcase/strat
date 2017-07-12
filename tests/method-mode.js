import format from '../index'
import test from 'ava'

test('extends arbitrary objects with the `format` method', t => {
  let someObject = Object.create(null)
  let someFunction = function () {}

  t.is(typeof someObject.format, 'undefined')
  t.is(typeof someFunction.format, 'undefined')

  format.extend(someObject)
  format.extend(someFunction)

  t.is(typeof someObject.format, 'function')
  t.is(typeof someFunction.format, 'function')
})

test('extending `String.prototype` allows calls on arbitrary strings', t => {
  t.is(typeof String.prototype.format, 'undefined')
  format.extend(String.prototype)
  t.is(typeof String.prototype.format, 'function')

  let expected = 'Prototypes need love too'
  let result = '{} need {} too'.format(['Prototypes', 'love'])

  t.is(result, expected)
})

test('allows partial application when called in method mode', t => {
  if (typeof String.prototype.format !== 'function') {
    format.extend(String.prototype)
  }

  /**
   * Partial application is not _quite_ as useful here, since
   * the `format()` method is now available on all strings,
   * so you can just store the string itself as the template.
   */

  let expected = 'Prototypes need love too'
  let partial = '{} need {} too'.format()
  let result = partial(['Prototypes', 'love'])

  t.is(result, expected)
})
