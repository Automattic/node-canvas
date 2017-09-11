/* eslint-env mocha */

'use strict'

/**
 * Module dependencies.
 */

const loadImage = require('../').loadImage
const Image = require('../').Image;

const assert = require('assert')
const assertRejects = require('assert-rejects')

const png_checkers = `${__dirname}/fixtures/checkers.png`
const png_clock = `${__dirname}/fixtures/clock.png`
const jpg_face = `${__dirname}/fixtures/face.jpeg`

describe('Image', function () {
  it('Prototype and ctor are well-shaped, don\'t hit asserts on accessors (GH-803)', function () {
    var img = new Image();
    assert.throws(function () { Image.prototype.width; }, /incompatible receiver/);
    assert(!img.hasOwnProperty('width'));
    assert('width' in img);
    assert(Image.prototype.hasOwnProperty('width'));
  });

  it('loads JPEG image', function () {
    return loadImage(jpg_face).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, jpg_face)
      assert.strictEqual(img.width, 485)
      assert.strictEqual(img.height, 401)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads PNG image', function () {
    return loadImage(png_clock).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, png_clock)
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)
      assert.strictEqual(img.complete, true)
    })
  })

  it('calls Image#onload multiple times', function () {
    return loadImage(png_clock).then((img) => {
      let onloadCalled = 0

      img.onload = () => { onloadCalled += 1 }

      img.src = png_checkers
      assert.strictEqual(img.src, png_checkers)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 2)
      assert.strictEqual(img.height, 2)

      img.src = png_clock
      assert.strictEqual(img.src, png_clock)
      assert.strictEqual(true, img.complete)
      assert.strictEqual(320, img.width)
      assert.strictEqual(320, img.height)

      assert.strictEqual(onloadCalled, 2)

      onloadCalled = 0
      img.onload = () => { onloadCalled += 1 }

      img.src = png_clock
      assert.strictEqual(onloadCalled, 1)
    })
  })

  it('handles errors', function () {
    return assertRejects(loadImage(`${png_clock}fail`), Error)
  })

  it('calls Image#onerror multiple times', function () {
    return loadImage(png_clock).then((img) => {
      let onloadCalled = 0
      let onerrorCalled = 0

      img.onload = () => { onloadCalled += 1 }
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${png_clock}s1`
      assert.strictEqual(img.src, `${png_clock}s1`)

      img.src = `${png_clock}s2`
      assert.strictEqual(img.src, `${png_clock}s2`)

      assert.strictEqual(onerrorCalled, 2)

      onerrorCalled = 0
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${png_clock}s3`
      assert.strictEqual(img.src, `${png_clock}s3`)

      assert.strictEqual(onerrorCalled, 1)
      assert.strictEqual(onloadCalled, 0)
    })
  })

  it('Image#{width,height}', function () {
    return loadImage(png_clock).then((img) => {
      img.src = ''
      assert.strictEqual(img.width, 0)
      assert.strictEqual(img.height, 0)

      img.src = png_clock
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)
    })
  })

  it('Image#src set empty buffer', function () {
    return loadImage(png_clock).then((img) => {
      let onerrorCalled = 0

      img.onerror = () => { onerrorCalled += 1 }

      img.src = new Buffer(0)
      assert.strictEqual(img.width, 0)
      assert.strictEqual(img.height, 0)

      assert.strictEqual(onerrorCalled, 1)
    })
  })

  it('should unbind Image#onload', function() {
    return loadImage(png_clock).then((img) => {
      let onloadCalled = 0

      img.onload = () => { onloadCalled += 1 }

      img.src = png_checkers
      assert.strictEqual(img.src, png_checkers)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 2)
      assert.strictEqual(img.height, 2)

      assert.strictEqual(onloadCalled, 1)

      onloadCalled = 0
      img.onload = null

      img.src = png_clock
      assert.strictEqual(img.src, png_clock)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)

      assert.strictEqual(onloadCalled, 0)
    })
  })

  it('should unbind Image#onerror', function() {
    return loadImage(png_clock).then((img) => {
      let onloadCalled = 0
      let onerrorCalled = 0

      img.onload = () => { onloadCalled += 1 }
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${png_clock}s1`
      assert.strictEqual(img.src, `${png_clock}s1`)

      img.src = `${png_clock}s2`
      assert.strictEqual(img.src, `${png_clock}s2`)

      assert.strictEqual(onerrorCalled, 2)

      onerrorCalled = 0
      img.onerror = null

      img.src = `${png_clock}s3`
      assert.strictEqual(img.src, `${png_clock}s3`)

      assert.strictEqual(onloadCalled, 0)
      assert.strictEqual(onerrorCalled, 0)
    })
  })
})
