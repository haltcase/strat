const strat = require('strat')

const template = strat('Like {} and {}')

console.log(template(['salt', 'pepper']))
// -> 'Like salt and pepper'

console.log(template(['peanut butter', 'jelly']))
// -> 'Like peanut butter and jelly'
