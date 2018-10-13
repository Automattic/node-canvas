/* eslint-env mocha */

'use strict'

/**
 * Module dependencies.
 */

const loadImage = require('../').loadImage
const Image = require('../').Image

const assert = require('assert')
const assertRejects = require('assert-rejects')
const fs = require('fs')

const jpgChrome = `${__dirname}/fixtures/chrome.jpg`
const jpgCrash = `${__dirname}/fixtures/159-crash1.jpg`
const jpgFace = `${__dirname}/fixtures/face.jpeg`
const pngCheckers = `${__dirname}/fixtures/checkers.png`
const pngClock = `${__dirname}/fixtures/clock.png`
const svgTree = `${__dirname}/fixtures/tree.svg`
const webpTest = `${__dirname}/fixtures/test.webp`

function waitFor (fn) {
  return new Promise((resolve) => {
    const id = setInterval(() => fn() && resolve(clearInterval(id)), 20)
  })
}

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('Image', function () {
  it('Prototype and ctor are well-shaped, don\'t hit asserts on accessors (GH-803)', function () {
    const img = new Image()
    assert.throws(() => Image.prototype.width, /incompatible receiver/)
    assert(!img.hasOwnProperty('width'))
    assert('width' in img)
    assert(Image.prototype.hasOwnProperty('width'))
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

  it('loads SVG data URL base64', function () {
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

  it('loads WebP image', function () {
    return loadImage(webpTest).then((img) => {
      assert.strictEqual(img.onerror, null)
      assert.strictEqual(img.onload, null)

      assert.strictEqual(img.src, webpTest)
      assert.strictEqual(img.width, 128)
      assert.strictEqual(img.height, 128)
      assert.strictEqual(img.complete, true)
    })
  })

  it('calls Image#onload multiple times', function () {
    return loadImage(pngClock).then((img) => {
      return Promise.resolve()
        .then(() => {
          return new Promise((resolve, reject) => {
            img.onerror = reject
            img.onload = resolve
            img.src = pngCheckers
          })
        })
        .then(() => {
          assert.strictEqual(img.src, pngCheckers)
          assert.strictEqual(img.complete, true)
          assert.strictEqual(img.width, 2)
          assert.strictEqual(img.height, 2)
        }).then(() => {
          return new Promise((resolve, reject) => {
            img.onerror = reject
            img.onload = resolve
            img.src = pngClock
          })
        })
        .then(() => {
          assert.strictEqual(img.src, pngClock)
          assert.strictEqual(img.complete, true)
          assert.strictEqual(img.width, 320)
          assert.strictEqual(img.height, 320)
        }).then(() => {
          return new Promise((resolve, reject) => {
            img.onerror = reject
            img.onload = resolve
            img.src = pngClock
          })
        })
    })
  })

  it('handles errors', function () {
    return assertRejects(loadImage(`${pngClock}fail`), Error)
  })

  it('returns a nice, coded error for fopen failures', async () => {
    await assertRejects(loadImage('path/to/nothing'), (err) => {
      assert.strictEqual(err.code, 'ENOENT')
      assert.strictEqual(err.path, 'path/to/nothing')
      assert.strictEqual(err.syscall, 'open')
      return true
    })
  })

  it('captures errors from libjpeg', async () => {
    await assertRejects(loadImage(jpgCrash), (err) => {
      assert.strictEqual(err.message, 'JPEG datastream contains no image')
      return true
    })
  })

  it('calls Image#onerror multiple times', async () => {
    const img = await loadImage(pngClock)

    await new Promise((resolve, reject) => {
      img.onload = () => reject(new Error('onload unexpectedly called'))
      img.onerror = () => resolve()
      img.src = `${pngClock}s1`
      assert.strictEqual(img.src, `${pngClock}s1`)
    })

    await new Promise((resolve, reject) => {
      img.onload = () => reject(new Error('onload unexpectedly called'))
      img.onerror = () => resolve()
      img.src = `${pngClock}s2`
      assert.strictEqual(img.src, `${pngClock}s2`)
    })

    await new Promise((resolve, reject) => {
      img.onload = () => reject(new Error('onload unexpectedly called'))
      img.onerror = () => resolve()
      img.src = `${pngClock}s3`
      assert.strictEqual(img.src, `${pngClock}s3`)
    })
  })

  it('Image#{width,height}', async () => {
    const img = await loadImage(pngClock)

    img.src = ''
    assert.strictEqual(img.width, 0)
    assert.strictEqual(img.height, 0)

    img.src = pngClock
    assert.strictEqual(img.width, 0)
    assert.strictEqual(img.height, 0)

    await new Promise((resolve) => { img.onload = resolve })

    assert.strictEqual(img.width, 320)
    assert.strictEqual(img.height, 320)
  })

  it('Image#src set empty buffer', async () => {
    const img = new Image()

    img.src = Buffer.alloc(0)

    assert.strictEqual(img.width, 0)
    assert.strictEqual(img.height, 0)

    await new Promise((resolve, reject) => {
      img.onerror = () => resolve()
      img.onload = () => reject(new Error('onload unexpectedly called'))
    })
  })

  it('should unbind Image#onload', async () => {
    const img = new Image()

    let onloadCalled = 0
    img.onload = () => { onloadCalled += 1 }

    img.src = pngCheckers
    assert.strictEqual(img.src, pngCheckers)
    assert.strictEqual(img.complete, false)
    assert.strictEqual(img.width, 0)
    assert.strictEqual(img.height, 0)

    await waitFor(() => onloadCalled === 1)

    assert.strictEqual(onloadCalled, 1)
    assert.strictEqual(img.complete, true)
    assert.strictEqual(img.width, 2)
    assert.strictEqual(img.height, 2)

    onloadCalled = 0
    img.onload = null

    img.src = pngClock
    assert.strictEqual(img.src, pngClock)
    assert.strictEqual(img.complete, false)
    assert.strictEqual(img.width, 0)
    assert.strictEqual(img.height, 0)

    await sleep(20)

    assert.strictEqual(onloadCalled, 0)
    assert.strictEqual(img.complete, true)
    assert.strictEqual(img.width, 320)
    assert.strictEqual(img.height, 320)
  })

  it('should unbind Image#onerror', async () => {
    const img = new Image()

    let onloadCalled = 0
    let onerrorCalled = 0

    img.onload = () => { onloadCalled += 1 }
    img.onerror = () => { onerrorCalled += 1 }

    img.src = `${pngClock}s1`
    assert.strictEqual(img.src, `${pngClock}s1`)

    await waitFor(() => onerrorCalled === 1)

    img.src = `${pngClock}s2`
    assert.strictEqual(img.src, `${pngClock}s2`)

    await waitFor(() => onerrorCalled === 2)

    onerrorCalled = 0
    img.onerror = null

    let globalErrorEmitted = false

    const originalEmit = process.emit
    process.emit = () => (globalErrorEmitted = true)

    try {
      img.src = `${pngClock}s3`
      assert.strictEqual(img.src, `${pngClock}s3`)

      await sleep(20)

      assert.strictEqual(onloadCalled, 0)
      assert.strictEqual(onerrorCalled, 0)
    } finally {
      process.emit = originalEmit
    }

    assert.strictEqual(globalErrorEmitted, true)
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

  it('aborts in-progress loads', async () => {
    const img = new Image()

    let onloadCalled = 0
    img.onload = () => onloadCalled++

    img.src = pngCheckers
    img.src = jpgChrome
    img.src = pngClock

    await waitFor(() => onloadCalled === 1)
  })
})
