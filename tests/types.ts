import strat from '..'

const single = strat('{}', 'hi')
const multiple = strat('{}', ['hi', 'again'])

const template1 = strat('{} + {} = happiness')
const res1 = template1(['typescript', 'strat'])
const res2 = template1()
const res3 = template1(null)
const res4 = template1(undefined)

const template2 = strat('{}', null)
const template3 = strat('{}', undefined)

const format = strat.create({
  upper: v => v.toUpperCase(),
  lower: v => v.toLowerCase()
})

strat.extend(String.prototype)

const arrayError = strat.errors.ERR_ARGS_ARRAY
const mixingError = strat.errors.ERR_NUMBERING_MIX

declare global {
  interface String {
    format (replacements: any): string
  }
}

const str1 = '{}'.format('hello')
const str2 = format('{!upper}', 'hello')
