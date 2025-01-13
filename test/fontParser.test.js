/* eslint-env mocha */

'use strict'

/**
 * Module dependencies.
 */
const assert = require('assert')
const {Canvas} = require('..');

const tests = [
  '20px Arial',
  { size: 20, families: ['arial'] },
  '20pt Arial',
  { size: 26.666667461395264, families: ['arial'] },
  '20.5pt Arial',
  { size: 27.333334147930145, families: ['arial'] },
  '20% Arial',
  { size: 3.1999999284744263, families: ['arial'] },
  '20mm Arial',
  { size: 75.59999942779541, families: ['arial'] },
  '20px serif',
  { size: 20, families: ['serif'] },
  '20px sans-serif',
  { size: 20, families: ['sans-serif'] },
  '20px monospace',
  { size: 20, families: ['monospace'] },
  '50px Arial, sans-serif',
  { size: 50, families: ['arial', 'sans-serif'] },
  'bold italic 50px Arial, sans-serif',
  { style: 1, weight: 700, size: 50, families: ['arial', 'sans-serif'] },
  '50px Helvetica ,  Arial, sans-serif',
  { size: 50, families: ['helvetica', 'arial', 'sans-serif'] },
  '50px "Helvetica Neue", sans-serif',
  { size: 50, families: ['Helvetica Neue', 'sans-serif'] },
  '50px "Helvetica Neue", "foo bar baz" , sans-serif',
  { size: 50, families: ['Helvetica Neue', 'foo bar baz', 'sans-serif'] },
  "50px 'Helvetica Neue'",
  { size: 50, families: ['Helvetica Neue'] },
  'italic 20px Arial',
  { size: 20, style: 1, families: ['arial'] },
  'oblique 20px Arial',
  { size: 20, style: 2, families: ['arial'] },
  'normal 20px Arial',
  { size: 20, families: ['arial'] },
  '300 20px Arial',
  { size: 20, weight: 300, families: ['arial'] },
  '800 20px Arial',
  { size: 20, weight: 800, families: ['arial'] },
  'bolder 20px Arial',
  { size: 20, weight: 700, families: ['arial'] },
  'lighter 20px Arial',
  { size: 20, weight: 100, families: ['arial'] },
  'normal normal normal 16px Impact',
  { size: 16, families: ['impact'] },
  'italic small-caps bolder 16px cursive',
  { size: 16, style: 1, variant: 1, weight: 700, families: ['cursive'] },
  '20px "new century schoolbook", serif',
  { size: 20, families: ['new century schoolbook', 'serif'] },
  '20px "Arial bold 300"', // synthetic case with weight keyword inside family
  { size: 20, families: ['Arial bold 300'] },
  `50px "Helvetica 'Neue'", "foo \\"bar\\" baz" , "Someone's weird \\'edge\\' case", sans-serif`,
  { size: 50, families: [`Helvetica 'Neue'`, 'foo "bar" baz', `Someone's weird 'edge' case`, 'sans-serif'] },
  'Helvetica, sans',
  undefined,
  '123px thefont/123abc',
  undefined,
  '123px /\tnormal thefont',
  {size: 123, families: ['thefont']},
  '12px/1.2whoops arial',
  undefined,
  'bold bold 12px thefont',
  undefined,
  'italic italic 12px Arial',
  undefined,
  'small-caps bold italic small-caps 12px Arial',
  undefined,
  'small-caps bold oblique 12px \'A\'ri\\61l',
  {size: 12, style: 2, weight: 700, variant: 1, families: ['Arial']},
  '12px/34% "The\\\n Word"',
  {size: 12, families: ['The Word']},
  '',
  undefined,
  'normal normal normal 1%/normal a   ,     \'b\'',
  {size: 0.1599999964237213, families: ['a', 'b']},
  'normalnormalnormal 1px/normal a',
  undefined,
  '12px _the_font',
  {size: 12, families: ['_the_font']},
  '9px 7 birds',
  undefined,
  '2em "Courier',
  undefined,
  `2em \\'Courier\\"`,
  {size: 32, families: ['\'courier"']},
  '1px \\10abcde',
  {size: 1, families: [String.fromCodePoint(parseInt('10abcd', 16)) + 'e']},
  '3E+2 1e-1px yay',
  {weight: 300, size: 0.1, families: ['yay']}
];

describe('Font parser', function () {
  for (let i = 0; i < tests.length; i++) {
    const str = tests[i++]
    it(str, function () {
      const expected = tests[i]
      const actual = Canvas.parseFont(str)

      if (expected) {
        if (expected.style == null) expected.style = 0
        if (expected.weight == null) expected.weight = 400
        if (expected.variant == null) expected.variant = 0
      }

      assert.deepEqual(actual, expected)
    })
  }
})
