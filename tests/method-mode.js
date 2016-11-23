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

test('allows currying when called in method mode', t => {
  if (typeof String.prototype.format !== 'function') {
    format.extend(String.prototype)
  }

  /**
   * Currying is not quite as useful here, since you could
   * just as easily `let result = ''.format` and then call
   * that ( which is even less characters in this case ).
   */

  let expected = 'Prototypes need love too'
  let curried = '{} need {} too'.format()
  let result = curried(['Prototypes', 'love'])

  t.is(result, expected)
})
