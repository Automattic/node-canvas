/* eslint-env mocha */

'use strict'

/**
 * Module dependencies.
 */
const assert = require('assert')
const assertRejects = require('assert-rejects')
const fs = require('fs')
const path = require('path')

const { createCanvas, loadImage, rsvgVersion, Image } = require('../')
const HAVE_SVG = rsvgVersion !== undefined


const pngCheckers = path.join(__dirname, '/fixtures/checkers.png')
const pngClock = path.join(__dirname, '/fixtures/clock.png')
const jpgChrome = path.join(__dirname, '/fixtures/chrome.jpg')
const jpgFace = path.join(__dirname, '/fixtures/face.jpeg')
const svgTree = path.join(__dirname, '/fixtures/tree.svg')
const bmpDir = path.join(__dirname, '/fixtures/bmp')

describe('Image', function () {
  it('Prototype and ctor are well-shaped, don\'t hit asserts on accessors (GH-803)', function () {
    const img = new Image()
    assert.throws(function () { Image.prototype.width }, /invalid argument/i)
    assert(!img.hasOwnProperty('width'))
    assert('width' in img)
    assert(Image.prototype.hasOwnProperty('width'))
  })

  it('Image has class string of `HTMLImageElement`', async function () {
    const img = new Image()
    assert.strictEqual(Object.prototype.toString.call(img), '[object HTMLImageElement]')
  })

  it('loads JPEG image', function () {
    return loadImage(jpgFace).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, jpgFace)
      assert.strictEqual(img.width, 485)
      assert.strictEqual(img.height, 401)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads JPEG data URL', function () {
    const base64Encoded = fs.readFileSync(jpgFace, 'base64')
    const dataURL = `data:image/png;base64,${base64Encoded}`

    return loadImage(dataURL).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, dataURL)
      assert.strictEqual(img.width, 485)
      assert.strictEqual(img.height, 401)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads PNG image', function () {
    return loadImage(pngClock).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, pngClock)
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads PNG data URL', function () {
    const base64Encoded = fs.readFileSync(pngClock, 'base64')
    const dataURL = `data:image/png;base64,${base64Encoded}`

    return loadImage(dataURL).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, dataURL)
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)
      assert.strictEqual(img.complete, true)
    })
  })

  it('detects invalid PNG', function (done) {
    if (process.platform === 'win32') this.skip() // TODO
    const img = new Image()
    img.onerror = () => {
      assert.strictEqual(img.complete, true)
      done()
    }
    img.src = Buffer.from('89504E470D', 'hex')
  })

  it('propagates exceptions thrown by onload', function () {
    class MyError extends Error {}
    const img = new Image()
    img.onload = () => {
      throw new MyError()
    }
    assert.throws(() => {
      img.src = jpgFace
    }, MyError)
  })

  it('propagates exceptions thrown by onerror', function () {
    class MyError extends Error {}
    const img = new Image()
    img.onerror = () => {
      throw new MyError()
    }
    assert.throws(() => {
      img.src = Buffer.from('', 'hex')
    }, MyError)
  })

  it('loads SVG data URL base64', function () {
    if (!HAVE_SVG) this.skip()
    const base64Enc = fs.readFileSync(svgTree, 'base64')
    const dataURL = `data:image/svg+xml;base64,${base64Enc}`
    return loadImage(dataURL).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)
      assert.strictEqual(img.width, 200)
      assert.strictEqual(img.height, 200)
      assert.strictEqual(img.complete, true)
    })
  })

  it('loads SVG data URL utf8', function () {
    if (!HAVE_SVG) this.skip()
    const utf8Encoded = fs.readFileSync(svgTree, 'utf8')
    const dataURL = `data:image/svg+xml;utf8,${utf8Encoded}`
    return loadImage(dataURL).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)
      assert.strictEqual(img.width, 200)
      assert.strictEqual(img.height, 200)
      assert.strictEqual(img.complete, true)
    })
  })

  it('calls Image#onload multiple times', function () {
    return loadImage(pngClock).then((img) => {
      let onloadCalled = 0

      img.onload = () => { onloadCalled += 1 }

      img.src = pngCheckers
      assert.strictEqual(img.src, pngCheckers)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 2)
      assert.strictEqual(img.height, 2)

      img.src = pngClock
      assert.strictEqual(img.src, pngClock)
      assert.strictEqual(true, img.complete)
      assert.strictEqual(320, img.width)
      assert.strictEqual(320, img.height)

      assert.strictEqual(onloadCalled, 2)

      onloadCalled = 0
      img.onload = () => { onloadCalled += 1 }

      img.src = pngClock
      assert.strictEqual(onloadCalled, 1)
    })
  })

  it('handles errors', function () {
    return assertRejects(loadImage(`${pngClock}fail`), Error)
  })

  it('returns a nice, coded error for fopen failures', function (done) {
    const img = new Image()
    img.onerror = err => {
      assert.equal(err.message, 'No such file or directory')
      assert.equal(err.path, 'path/to/nothing')
      assert.equal(err.syscall, 'fopen')
      assert.strictEqual(img.complete, true)
      done()
    }
    img.src = 'path/to/nothing'
  })

  it('captures errors from libjpeg', function (done) {
    const img = new Image()
    img.onerror = err => {
      assert.equal(err.message, 'JPEG datastream contains no image')
      assert.strictEqual(img.complete, true)
      done()
    }
    img.src = path.join(__dirname, '/fixtures/159-crash1.jpg')
  })

  it('calls Image#onerror multiple times', function () {
    return loadImage(pngClock).then((img) => {
      let onloadCalled = 0
      let onerrorCalled = 0

      img.onload = () => { onloadCalled += 1 }
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${pngClock}s1`
      assert.strictEqual(img.src, `${pngClock}s1`)

      img.src = `${pngClock}s2`
      assert.strictEqual(img.src, `${pngClock}s2`)

      assert.strictEqual(onerrorCalled, 2)

      onerrorCalled = 0
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${pngClock}s3`
      assert.strictEqual(img.src, `${pngClock}s3`)

      assert.strictEqual(onerrorCalled, 1)
      assert.strictEqual(onloadCalled, 0)
    })
  })

  it('Image#{width,height}', function () {
    return loadImage(pngClock).then((img) => {
      img.src = ''
      assert.strictEqual(img.width, 0)
      assert.strictEqual(img.height, 0)

      img.src = pngClock
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)
    })
  })

  it('Image#src set empty buffer', function () {
    return loadImage(pngClock).then((img) => {
      let onerrorCalled = 0

      img.onerror = () => { onerrorCalled += 1 }

      img.src = Buffer.alloc(0)
      assert.strictEqual(img.width, 0)
      assert.strictEqual(img.height, 0)
      assert.strictEqual(img.complete, true)

      assert.strictEqual(onerrorCalled, 1)
    })
  })

  it('should unbind Image#onload', function () {
    return loadImage(pngClock).then((img) => {
      let onloadCalled = 0

      img.onload = () => { onloadCalled += 1 }

      img.src = pngCheckers
      assert.strictEqual(img.src, pngCheckers)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 2)
      assert.strictEqual(img.height, 2)

      assert.strictEqual(onloadCalled, 1)

      onloadCalled = 0
      img.onload = null

      img.src = pngClock
      assert.strictEqual(img.src, pngClock)
      assert.strictEqual(img.complete, true)
      assert.strictEqual(img.width, 320)
      assert.strictEqual(img.height, 320)

      assert.strictEqual(onloadCalled, 0)
    })
  })

  it('should unbind Image#onerror', function () {
    return loadImage(pngClock).then((img) => {
      let onloadCalled = 0
      let onerrorCalled = 0

      img.onload = () => { onloadCalled += 1 }
      img.onerror = () => { onerrorCalled += 1 }

      img.src = `${pngClock}s1`
      assert.strictEqual(img.src, `${pngClock}s1`)

      img.src = `${pngClock}s2`
      assert.strictEqual(img.src, `${pngClock}s2`)

      assert.strictEqual(onerrorCalled, 2)

      onerrorCalled = 0
      img.onerror = null

      img.src = `${pngClock}s3`
      assert.strictEqual(img.src, `${pngClock}s3`)

      assert.strictEqual(onloadCalled, 0)
      assert.strictEqual(onerrorCalled, 0)
    })
  })

  it('does not crash on invalid images', function () {
    function withIncreasedByte (source, index) {
      const copy = source.slice(0)

      copy[index] += 1

      return copy
    }

    const source = fs.readFileSync(jpgChrome)

    const corruptSources = [
      withIncreasedByte(source, 0),
      withIncreasedByte(source, 1),
      withIncreasedByte(source, 1060),
      withIncreasedByte(source, 1061),
      withIncreasedByte(source, 1062),
      withIncreasedByte(source, 1063),
      withIncreasedByte(source, 1064),
      withIncreasedByte(source, 1065),
      withIncreasedByte(source, 1066),
      withIncreasedByte(source, 1067),
      withIncreasedByte(source, 1068),
      withIncreasedByte(source, 1069)
    ]

    return Promise.all(corruptSources.map(src => loadImage(src).catch(() => null)))
  })

  it('does not contain `source` property', function () {
    const keys = Reflect.ownKeys(Image.prototype)
    assert.ok(!keys.includes('source'))
    assert.ok(!keys.includes('getSource'))
    assert.ok(!keys.includes('setSource'))
  })

  describe('supports BMP', function () {
    it('parses 1-bit image', function (done) {
      const img = new Image()

      img.onload = () => {
        assert.strictEqual(img.width, 111)
        assert.strictEqual(img.height, 72)
        done()
      }

      img.onerror = err => { throw err }
      img.src = path.join(bmpDir, '1-bit.bmp')
    })

    it('parses 4-bit image', function (done) {
      const img = new Image()

      img.onload = () => {
        assert.strictEqual(img.width, 32)
        assert.strictEqual(img.height, 32)
        done()
      }

      img.onerror = err => { throw err }
      img.src = path.join(bmpDir, '4-bit.bmp')
    })

    it('parses 8-bit image')

    it('parses 24-bit image', function (done) {
      const img = new Image()

      img.onload = () => {
        assert.strictEqual(img.width, 2)
        assert.strictEqual(img.height, 2)

        testImgd(img, [
          0, 0, 255, 255,
          0, 255, 0, 255,
          255, 0, 0, 255,
          255, 255, 255, 255
        ])

        done()
      }

      img.onerror = err => { throw err }
      img.src = path.join(bmpDir, '24-bit.bmp')
    })

    it('parses 32-bit image', function (done) {
      const img = new Image()

      img.onload = () => {
        assert.strictEqual(img.width, 4)
        assert.strictEqual(img.height, 2)

        testImgd(img, [
          0, 0, 255, 255,
          0, 255, 0, 255,
          255, 0, 0, 255,
          255, 255, 255, 255,
          0, 0, 255, 127,
          0, 255, 0, 127,
          255, 0, 0, 127,
          255, 255, 255, 127
        ])

        done()
      }

      img.onerror = err => { throw err }
      img.src = fs.readFileSync(path.join(bmpDir, '32-bit.bmp')) // Also tests loading from buffer
    })

    it('parses minimal BMP', function (done) {
      const img = new Image()

      img.onload = () => {
        assert.strictEqual(img.width, 1)
        assert.strictEqual(img.height, 1)

        testImgd(img, [
          255, 0, 0, 255
        ])

        done()
      }

      img.onerror = err => { throw err }
      img.src = path.join(bmpDir, 'min.bmp')
    })

    it('properly handles negative height', function (done) {
      const img = new Image()

      img.onload = () => {
        assert.strictEqual(img.width, 1)
        assert.strictEqual(img.height, 2)

        testImgd(img, [
          255, 0, 0, 255,
          0, 255, 0, 255
        ])

        done()
      }

      img.onerror = err => { throw err }
      img.src = path.join(bmpDir, 'negative-height.bmp')
    })

    it('color palette', function (done) {
      const img = new Image()

      img.onload = () => {
        assert.strictEqual(img.width, 32)
        assert.strictEqual(img.height, 32)
        done()
      }

      img.onerror = err => { throw err }
      img.src = path.join(bmpDir, 'palette.bmp')
    })

    it('V3 header', function (done) {
      const img = new Image()

      img.onload = () => {
        assert.strictEqual(img.width, 256)
        assert.strictEqual(img.height, 192)
        done()
      }

      img.onerror = err => { throw err }
      img.src = path.join(bmpDir, 'v3-header.bmp')
    })

    it('V5 header')

    it('catches BMP errors', function (done) {
      const img = new Image()

      img.onload = () => {
        throw new Error('Invalid image should not be loaded properly')
      }

      img.onerror = err => {
        const msg = 'Error while processing file header - unexpected end of file'
        assert.strictEqual(err.message, msg)
        done()
      }

      img.src = Buffer.from('BM')
    })

    it('BMP bomb', function (done) {
      const img = new Image()

      img.onload = () => {
        throw new Error('Invalid image should not be loaded properly')
      }

      img.onerror = err => {
        if (!err) throw new Error('Expected a error')
        done()
      }

      img.src = path.join(bmpDir, 'bomb.bmp')
    })

    function testImgd (img, data) {
      const ctx = createCanvas(img.width, img.height).getContext('2d')
      ctx.drawImage(img, 0, 0)
      const actualData = ctx.getImageData(0, 0, img.width, img.height).data
      assert.strictEqual(String(actualData), String(data))
    }
  })
})
