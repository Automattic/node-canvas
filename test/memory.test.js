/* eslint-env mocha */

'use strict'

// These tests require --expose-gc. Skip gracefully if not available.
const gcAvailable = typeof gc === 'function'

const assert = require('assert')
const { createCanvas } = require('../')

describe('Memory management', function () {
  before(function () {
    if (!gcAvailable) this.skip()
  })

  it('Canvas objects are freed by GC', function () {
    const ITERATIONS = 100
    const SIZE = 1024 // 1024x1024 ARGB = 4 MiB per canvas

    for (let i = 0; i < ITERATIONS; i++) {
      const canvas = createCanvas(SIZE, SIZE)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'red'
      ctx.fillRect(0, 0, SIZE, SIZE)
      gc()
    }

    gc()
    gc()

    // 100 canvases x 4 MiB = 400 MiB if leaked.
    // With proper GC, RSS should stay well under 150 MiB.
    const rssMiB = process.memoryUsage().rss / 1024 / 1024
    assert(rssMiB < 150, `RSS is ${rssMiB.toFixed(0)} MiB, expected < 150 MiB`)
  })
})
