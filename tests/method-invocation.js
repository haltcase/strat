import strat from '../index'
import test from 'ava'

const obj = {
  echo: value => value,
  addFive: value => Number(value) + 5,
  xform (str, upper, reverse) {
    let output = str + ' ' + str
    if (upper) output = output.toUpperCase()
    if (reverse) output = output.split('').reverse().join('')
    return output
  },
  countNulls (one, two, three, four, five, six) {
    return Array
      .from(arguments)
      .filter(v => v === null)
      .length
  }
}

test('invokes methods taking no arguments', t => {
  t.is(strat('{0.toLowerCase}', ['TINY BOOM']), 'tiny boom')
  t.is(strat('{0.toUpperCase}', ['huge boom']), 'HUGE BOOM')
  t.is(strat('{0.getFullYear}', [new Date('13 Sep 1994')]), '1994')
  t.is(strat('{pop} {pop} {pop}', [['one', 'two', 'three']]), 'three two one')
})

test('invokes methods and passes a single argument', t => {
  t.is(strat('{addFive 1}', obj), '6')
  t.is(strat('{addFive 2}', obj), '7')
  t.is(strat('{addFive 3}', obj), '8')
})

test('invokes methods and passes multiple arguments', t => {
  t.is(strat('{xform hi, true}', obj), 'HI HI')
  t.is(strat('{xform hi, _, true}', obj), 'ih ih')
  t.is(strat('{xform hi, true, true}', obj), 'IH IH')
})

test('allows passing `_` to nullify an argument', t => {
  t.is(strat('{countNulls 1, 2, 3, 4, 5, 6}', obj), '0')
  t.is(strat('{countNulls 1, 2, 3, _, 5, 6}', obj), '1')
  t.is(strat('{countNulls _, 2, 3, _, 5, 6}', obj), '2')
  t.is(strat('{countNulls 1, _, 3, _, _, 6}', obj), '3')
  t.is(strat('{countNulls _, _, 3, _, 5, _}', obj), '4')
  t.is(strat('{countNulls _, _, _, 4, _, _}', obj), '5')
  t.is(strat('{countNulls _, _, _, _, _, _}', obj), '6')
})

test('treats `__` as an escaped `_`', t => {
  t.is(strat('{echo __}', obj), '_')
})
