/* eslint-env mocha */

'use strict'

const assert = require('assert')
const parseDataURL = require('../lib/parse-data-url')

describe('Data URL payload decoding', function () {
  const cases = [
    ['raw UTF-8', 'data:,café 😀', Buffer.from('café 😀')],
    ['encoded UTF-8', 'data:,%63af%C3%A9%20%F0%9F%98%80', Buffer.from('café 😀')],
    ['mixed raw and encoded UTF-8', 'data:,café%20😀', Buffer.from('café 😀')],
    ['binary bytes', 'data:,%00%80%FF', Buffer.from([0, 128, 255])],
    ['hex letter case', 'data:,%aB%Cd%eF', Buffer.from([171, 205, 239])],
    ['literal plus', 'data:,a+b%2Bc', Buffer.from('a+b+c')],
    ['one decoding pass', 'data:,%2520%2525', Buffer.from('%20%25')],
    ['invalid escapes', 'data:,%%2%GG%2G%G2%20%', Buffer.from('%%2%GG%2G%G2 %')],
    ['empty payload', 'data:,', Buffer.alloc(0)],
    ['raw base64', 'data:;base64,AP/+', Buffer.from([0, 255, 254])],
    ['encoded base64', 'data:;base64,AP%2f%2b', Buffer.from([0, 255, 254])],
    ['encoded base64 padding', 'data:;base64,/w%3D%3D', Buffer.from([255])],
    ['encoded base64 whitespace', 'data:;base64,%20/w%3D%3D%0A', Buffer.from([255])],
    ['commas in payload', 'data:text/plain;charset=utf-8,a%2Cb,c', Buffer.from('a,b,c')]
  ]

  for (const [name, dataURL, expected] of cases) {
    it(name, function () {
      assert.deepStrictEqual(parseDataURL(dataURL), expected)
    })
  }

  it('decodes every possible byte', function () {
    const expected = Buffer.from(Array.from({ length: 256 }, (_, byte) => byte))
    const encoded = Array.from(expected, byte => '%' + byte.toString(16).padStart(2, '0')).join('')
    assert.deepStrictEqual(parseDataURL(`data:,${encoded}`), expected)
  })
})
