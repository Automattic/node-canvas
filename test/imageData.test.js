/* eslint-env mocha */

'use strict'

const createImageData = require('../').createImageData

const assert = require('assert')

describe('ImageData', function () {
  it('should throw with invalid numeric arguments', function () {
    assert.throws(() => { createImageData(0, 0) }, /width is zero/)
    assert.throws(() => { createImageData(1, 0) }, /height is zero/)
    assert.throws(() => { createImageData(0) }, TypeError)
  })

  it('should construct with width and height', function () {
    const imageData = createImageData(2, 3)

    assert.strictEqual(imageData.width, 2)
    assert.strictEqual(imageData.height, 3)

    assert.ok(imageData.data instanceof Uint8ClampedArray)
    assert.strictEqual(imageData.data.length, 24)
  })

  it('should throw with invalid typed array', function () {
    assert.throws(() => { createImageData(new Uint8ClampedArray(0), 0) }, /input data has a zero byte length/)
    assert.throws(() => { createImageData(new Uint8ClampedArray(3), 0) }, /source width is zero/)
    // Note: Some errors thrown by browsers are not thrown by node-canvas
    // because our ImageData can support different BPPs.
  });

  it('should construct with typed array', function () {
    let data, imageData

    data = new Uint8ClampedArray(2 * 3 * 4)
    imageData = createImageData(data, 2)
    assert.strictEqual(imageData.width, 2)
    assert.strictEqual(imageData.height, 3)
    assert.ok(imageData.data instanceof Uint8ClampedArray)
    assert.strictEqual(imageData.data.length, 24)

    data = new Uint8ClampedArray(3 * 4 * 4)
    imageData = createImageData(data, 3, 4)
    assert.strictEqual(imageData.width, 3)
    assert.strictEqual(imageData.height, 4)
    assert.ok(imageData.data instanceof Uint8ClampedArray)
    assert.strictEqual(imageData.data.length, 48)
  })
})
