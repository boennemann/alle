const test = require('tap').test

const sumOfNumbers = require('../packages/node_modules/sum-of-numbers')

test('is 18', (t) => {
  t.is(sumOfNumbers, 18)
  t.end()
})
