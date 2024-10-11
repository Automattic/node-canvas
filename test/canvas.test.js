/* eslint-env mocha */

'use strict'

/**
 * Module dependencies.
 */
const assert = require('assert')
const os = require('os')
const path = require('path')
const { Readable } = require('stream')

const {
  createCanvas,
  createImageData,
  loadImage,
  parseFont,
  registerFont,
  Canvas,
  deregisterAllFonts
} = require('../')

function assertApprox(actual, expected, tol) {
  assert(Math.abs(expected - actual) <= tol,
    "Expected " + actual + " to be " + expected + " +/- " + tol);
}

describe('Canvas', function () {
  // Run with --expose-gc and uncomment this line to help find memory problems:
  // afterEach(gc);

  it('Prototype and ctor are well-shaped, don\'t hit asserts on accessors (GH-803)', function () {
    const c = new Canvas(10, 10)
    assert.throws(function () { Canvas.prototype.width }, /invalid argument/i)
    assert(!c.hasOwnProperty('width'))
    assert('width' in c)
    assert('width' in Canvas.prototype)
  })

  it('.parseFont()', function () {
    const tests = [
      '20px Arial',
      { size: 20, unit: 'px', family: 'Arial' },
      '20pt Arial',
      { size: 26.666666666666668, unit: 'pt', family: 'Arial' },
      '20.5pt Arial',
      { size: 27.333333333333332, unit: 'pt', family: 'Arial' },
      '20% Arial',
      { size: 20, unit: '%', family: 'Arial' }, // TODO I think this is a bad assertion - ZB 23-Jul-2017
      '20mm Arial',
      { size: 75.59055118110237, unit: 'mm', family: 'Arial' },
      '20px serif',
      { size: 20, unit: 'px', family: 'serif' },
      '20px sans-serif',
      { size: 20, unit: 'px', family: 'sans-serif' },
      '20px monospace',
      { size: 20, unit: 'px', family: 'monospace' },
      '50px Arial, sans-serif',
      { size: 50, unit: 'px', family: 'Arial,sans-serif' },
      'bold italic 50px Arial, sans-serif',
      { style: 'italic', weight: 'bold', size: 50, unit: 'px', family: 'Arial,sans-serif' },
      '50px Helvetica ,  Arial, sans-serif',
      { size: 50, unit: 'px', family: 'Helvetica,Arial,sans-serif' },
      '50px "Helvetica Neue", sans-serif',
      { size: 50, unit: 'px', family: 'Helvetica Neue,sans-serif' },
      '50px "Helvetica Neue", "foo bar baz" , sans-serif',
      { size: 50, unit: 'px', family: 'Helvetica Neue,foo bar baz,sans-serif' },
      "50px 'Helvetica Neue'",
      { size: 50, unit: 'px', family: 'Helvetica Neue' },
      'italic 20px Arial',
      { size: 20, unit: 'px', style: 'italic', family: 'Arial' },
      'oblique 20px Arial',
      { size: 20, unit: 'px', style: 'oblique', family: 'Arial' },
      'normal 20px Arial',
      { size: 20, unit: 'px', style: 'normal', family: 'Arial' },
      '300 20px Arial',
      { size: 20, unit: 'px', weight: '300', family: 'Arial' },
      '800 20px Arial',
      { size: 20, unit: 'px', weight: '800', family: 'Arial' },
      'bolder 20px Arial',
      { size: 20, unit: 'px', weight: 'bolder', family: 'Arial' },
      'lighter 20px Arial',
      { size: 20, unit: 'px', weight: 'lighter', family: 'Arial' },
      'normal normal normal 16px Impact',
      { size: 16, unit: 'px', weight: 'normal', family: 'Impact', style: 'normal', variant: 'normal' },
      'italic small-caps bolder 16px cursive',
      { size: 16, unit: 'px', style: 'italic', variant: 'small-caps', weight: 'bolder', family: 'cursive' },
      '20px "new century schoolbook", serif',
      { size: 20, unit: 'px', family: 'new century schoolbook,serif' },
      '20px "Arial bold 300"', // synthetic case with weight keyword inside family
      { size: 20, unit: 'px', family: 'Arial bold 300', variant: 'normal' },
      `50px "Helvetica 'Neue'", "foo \\"bar\\" baz" , "Someone's weird \\'edge\\' case", sans-serif`,
      { size: 50, unit: 'px', family: `Helvetica 'Neue',foo "bar" baz,Someone's weird 'edge' case,sans-serif` }
    ]

    for (let i = 0, len = tests.length; i < len; ++i) {
      const str = tests[i++]
      const expected = tests[i]
      const actual = parseFont(str)

      if (!expected.style) expected.style = 'normal'
      if (!expected.weight) expected.weight = 'normal'
      if (!expected.stretch) expected.stretch = 'normal'
      if (!expected.variant) expected.variant = 'normal'

      assert.deepEqual(actual, expected, 'Failed to parse: ' + str)
    }

    assert.strictEqual(parseFont('Helvetica, sans'), undefined)
  })

  it('registerFont', function () {
    // Minimal test to make sure nothing is thrown
    registerFont('./examples/pfennigFont/Pfennig.ttf', { family: 'Pfennig' })
    registerFont('./examples/pfennigFont/PfennigBold.ttf', { family: 'Pfennig', weight: 'bold' })

    // Test to multi byte file path support
    registerFont('./examples/pfennigFont/pfennigMultiByte🚀.ttf', { family: 'Pfennig' })

    deregisterAllFonts()
  });

  it('color serialization', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d');

    ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function (prop) {
      ctx[prop] = '#FFFFFF'
      assert.equal('#ffffff', ctx[prop], prop + ' #FFFFFF -> #ffffff, got ' + ctx[prop])

      ctx[prop] = '#FFF'
      assert.equal('#ffffff', ctx[prop], prop + ' #FFF -> #ffffff, got ' + ctx[prop])

      ctx[prop] = 'rgba(128, 200, 128, 1)'
      assert.equal('#80c880', ctx[prop], prop + ' rgba(128, 200, 128, 1) -> #80c880, got ' + ctx[prop])

      ctx[prop] = 'rgba(128,80,0,0.5)'
      assert.equal('rgba(128, 80, 0, 0.50)', ctx[prop], prop + ' rgba(128,80,0,0.5) -> rgba(128, 80, 0, 0.5), got ' + ctx[prop])

      ctx[prop] = 'rgba(128,80,0,0.75)'
      assert.equal('rgba(128, 80, 0, 0.75)', ctx[prop], prop + ' rgba(128,80,0,0.75) -> rgba(128, 80, 0, 0.75), got ' + ctx[prop])

      if (prop === 'shadowColor') return

      const grad = ctx.createLinearGradient(0, 0, 0, 150)
      ctx[prop] = grad
      assert.strictEqual(grad, ctx[prop], prop + ' pattern getter failed')
    })
  })

  it('color parser', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffccaa'
    assert.equal('#ffccaa', ctx.fillStyle)

    ctx.fillStyle = '#FFCCAA'
    assert.equal('#ffccaa', ctx.fillStyle)

    ctx.fillStyle = '#FCA'
    assert.equal('#ffccaa', ctx.fillStyle)

    ctx.fillStyle = '#fff'
    ctx.fillStyle = '#FGG'
    assert.equal('#ff0000', ctx.fillStyle)

    ctx.fillStyle = '      #FCA'
    assert.equal('#ffccaa', ctx.fillStyle)

    ctx.fillStyle = '         #ffccaa'
    assert.equal('#ffccaa', ctx.fillStyle)


    ctx.fillStyle = '#fff'
    ctx.fillStyle = 'afasdfasdf'
    assert.equal('#ffffff', ctx.fillStyle)

    // #rgba and #rrggbbaa
    ctx.fillStyle = '#ffccaa80'
    assert.equal('rgba(255, 204, 170, 0.50)', ctx.fillStyle)

    ctx.fillStyle = '#acf8'
    assert.equal('rgba(170, 204, 255, 0.53)', ctx.fillStyle)

    ctx.fillStyle = '#BEAD'
    assert.equal('rgba(187, 238, 170, 0.87)', ctx.fillStyle)

    ctx.fillStyle = 'rgb(255,255,255)'
    assert.equal('#ffffff', ctx.fillStyle)

    ctx.fillStyle = 'rgb(0,0,0)'
    assert.equal('#000000', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 0  ,   0  ,  0)'
    assert.equal('#000000', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 0  ,   0  ,  0, 1)'
    assert.equal('#000000', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90, 0.5)'
    assert.equal('rgba(255, 200, 90, 0.50)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90, 0.75)'
    assert.equal('rgba(255, 200, 90, 0.75)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90, 0.7555)'
    assert.equal('rgba(255, 200, 90, 0.75)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90, .7555)'
    assert.equal('rgba(255, 200, 90, 0.75)', ctx.fillStyle)

    ctx.fillStyle = 'rgb(0, 0, 9000)'
    assert.equal('#0000ff', ctx.fillStyle)

    ctx.fillStyle = 'rgba(0, 0, 0, 42.42)'
    assert.equal('#000000', ctx.fillStyle)

    ctx.fillStyle = 'rgba(255, 250, 255)';
    assert.equal('#fffaff', ctx.fillStyle);

    ctx.fillStyle = 'rgba(124, 58, 26, 0)';
    assert.equal('rgba(124, 58, 26, 0.00)', ctx.fillStyle);

    ctx.fillStyle = 'rgba( 255, 200, 90, 40%)'
    assert.equal('rgba(255, 200, 90, 0.40)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90, 50 %)'
    assert.equal('rgba(255, 200, 90, 0.50)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90, 10%)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90, 10 %)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90 / 40%)'
    assert.equal('rgba(255, 200, 90, 0.40)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90 / 0.5)'
    assert.equal('rgba(255, 200, 90, 0.50)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90 / 10%)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255, 200, 90 / 0.1)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255 200 90 / 10%)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgba( 255 200 90  0.1)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgb(0, 0, 0, 42.42)'
    assert.equal('#000000', ctx.fillStyle)

    ctx.fillStyle = 'rgb(255, 250, 255)';
    assert.equal('#fffaff', ctx.fillStyle);

    ctx.fillStyle = 'rgb(124, 58, 26, 0)';
    assert.equal('rgba(124, 58, 26, 0.00)', ctx.fillStyle);

    ctx.fillStyle = 'rgb( 255, 200, 90, 40%)'
    assert.equal('rgba(255, 200, 90, 0.40)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255, 200, 90, 50 %)'
    assert.equal('rgba(255, 200, 90, 0.50)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255, 200, 90, 10%)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255, 200, 90, 10 %)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255, 200, 90 / 40%)'
    assert.equal('rgba(255, 200, 90, 0.40)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255, 200, 90 / 0.5)'
    assert.equal('rgba(255, 200, 90, 0.50)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255, 200, 90 / 10%)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255, 200, 90 / 0.1)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255 200 90 / 10%)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255 200 90  0.1)'
    assert.equal('rgba(255, 200, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = '       rgb( 255 100 90  0.1)'
    assert.equal('rgba(255, 100, 90, 0.10)', ctx.fillStyle)

    ctx.fillStyle = 'rgb(124.00, 58, 26, 0)';
    assert.equal('rgba(124, 58, 26, 0.00)', ctx.fillStyle);

    ctx.fillStyle = 'rgb( 255, 200.09, 90, 40%)'
    assert.equal('rgba(255, 201, 90, 0.40)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255.00, 199.03, 90, 50 %)'
    assert.equal('rgba(255, 200, 90, 0.50)', ctx.fillStyle)

    ctx.fillStyle = 'rgb( 255, 300.09, 90, 40%)'
    assert.equal('rgba(255, 255, 90, 0.40)', ctx.fillStyle)
    // hsl / hsla tests

    ctx.fillStyle = 'hsl(0, 0%, 0%)'
    assert.equal('#000000', ctx.fillStyle)

    ctx.fillStyle = 'hsl(3600, -10%, -10%)'
    assert.equal('#000000', ctx.fillStyle)

    ctx.fillStyle = 'hsl(10, 100%, 42%)'
    assert.equal('#d62400', ctx.fillStyle)

    ctx.fillStyle = 'hsl(370, 120%, 42%)'
    assert.equal('#d62400', ctx.fillStyle)

    ctx.fillStyle = 'hsl(0, 100%, 100%)'
    assert.equal('#ffffff', ctx.fillStyle)

    ctx.fillStyle = 'hsl(0, 150%, 150%)'
    assert.equal('#ffffff', ctx.fillStyle)

    ctx.fillStyle = 'hsl(237, 76%, 25%)'
    assert.equal('#0f1470', ctx.fillStyle)

    ctx.fillStyle = '      hsl(0, 150%, 150%)'
    assert.equal('#ffffff', ctx.fillStyle)

    ctx.fillStyle = 'hsl(240, 73%, 25%)'
    assert.equal('#11116e', ctx.fillStyle)

    ctx.fillStyle = 'hsl(262, 32%, 42%)'
    assert.equal('#62498d', ctx.fillStyle)

    ctx.fillStyle = 'hsla(0, 0%, 0%, 1)'
    assert.equal('#000000', ctx.fillStyle)

    ctx.fillStyle = 'hsla(0, 100%, 100%, 1)'
    assert.equal('#ffffff', ctx.fillStyle)

    ctx.fillStyle = 'hsla(120, 25%, 75%, 0.5)'
    assert.equal('rgba(175, 207, 175, 0.50)', ctx.fillStyle)

    ctx.fillStyle = 'hsla(240, 75%, 25%, 0.75)'
    assert.equal('rgba(16, 16, 112, 0.75)', ctx.fillStyle)

    ctx.fillStyle = 'hsla(172.0, 33.00000e0%, 42%, 1)'
    assert.equal('#488e85', ctx.fillStyle)

    ctx.fillStyle = 'hsl(124.5, 76.1%, 47.6%)'
    assert.equal('#1dd62b', ctx.fillStyle)

    ctx.fillStyle = 'hsl(1.24e2, 760e-1%, 4.7e1%)'
    assert.equal('#1dd329', ctx.fillStyle)

    // case-insensitive (#235)
    ctx.fillStyle = 'sILveR'
    assert.equal(ctx.fillStyle, '#c0c0c0')
  })

  it('Canvas#type', function () {
    let canvas = createCanvas(10, 10)
    assert.equal(canvas.type, 'image')
    canvas = createCanvas(10, 10, 'pdf')
    assert.equal(canvas.type, 'pdf')
    canvas = createCanvas(10, 10, 'svg')
    assert.equal(canvas.type, 'svg')
    canvas = createCanvas(10, 10, 'hey')
    assert.equal(canvas.type, 'image')
  })

  it('Canvas#getContext("2d")', function () {
    const canvas = createCanvas(200, 300)
    const ctx = canvas.getContext('2d')
    assert.ok(typeof ctx === 'object')
    assert.equal(canvas, ctx.canvas, 'context.canvas is not canvas')
    assert.equal(ctx, canvas.context, 'canvas.context is not context')

    const MAX_IMAGE_SIZE = 32767;

    [
      [0, 0, 1],
      [1, 0, 1],
      [MAX_IMAGE_SIZE, 0, 1],
      [MAX_IMAGE_SIZE + 1, 0, 3],
      [MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, null],
      [MAX_IMAGE_SIZE + 1, MAX_IMAGE_SIZE, 3],
      [MAX_IMAGE_SIZE + 1, MAX_IMAGE_SIZE + 1, 3],
      [Math.pow(2, 30), 0, 3],
      [Math.pow(2, 30), 1, 3],
      [Math.pow(2, 32), 0, 1],
      [Math.pow(2, 32), 1, 1]
    ].forEach(params => {
      const width = params[0]
      const height = params[1]
      const errorLevel = params[2]

      let level = 3

      try {
        const canvas = createCanvas(width, height)
        level--

        const ctx = canvas.getContext('2d')
        level--

        ctx.getImageData(0, 0, 1, 1)
        level--
      } catch (err) {}

      if (errorLevel !== null) { assert.strictEqual(level, errorLevel) }
    })
  })

  it('Canvas#getContext("2d", {pixelFormat: string})', function () {
    let canvas, context

    // default:
    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { pixelFormat: 'RGBA32' })
    assert.equal(context.pixelFormat, 'RGBA32')

    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { pixelFormat: 'RGBA32' })
    assert.equal(context.pixelFormat, 'RGBA32')

    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { pixelFormat: 'RGB24' })
    assert.equal(context.pixelFormat, 'RGB24')

    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { pixelFormat: 'A8' })
    assert.equal(context.pixelFormat, 'A8')

    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { pixelFormat: 'A1' })
    assert.equal(context.pixelFormat, 'A1')

    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { pixelFormat: 'RGB16_565' })
    assert.equal(context.pixelFormat, 'RGB16_565')

    // Not tested: RGB30
  })

  it('Canvas#getContext("2d", {alpha: boolean})', function () {
    let canvas, context

    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { alpha: true })
    assert.equal(context.pixelFormat, 'RGBA32')

    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { alpha: false })
    assert.equal(context.pixelFormat, 'RGB24')

    // alpha takes priority:
    canvas = createCanvas(10, 10)
    context = canvas.getContext('2d', { pixelFormat: 'RGBA32', alpha: false })
    assert.equal(context.pixelFormat, 'RGB24')
  })

  it('Canvas#{width,height}=', function () {
    const canvas = createCanvas(100, 200)
    const context = canvas.getContext('2d')

    assert.equal(canvas.width, 100)
    assert.equal(canvas.height, 200)

    context.globalAlpha = 0.5
    context.fillStyle = '#0f0'
    context.strokeStyle = '#0f0'
    context.font = '20px arial'
    context.fillRect(0, 0, 1, 1)

    canvas.width = 50
    canvas.height = 70
    assert.equal(canvas.width, 50)
    assert.equal(canvas.height, 70)

    context.font = '20px arial'
    assert.equal(context.font, '20px arial')
    canvas.width |= 0

    assert.equal(context.lineWidth, 1) // #1095
    assert.equal(context.globalAlpha, 1) // #1292
    assert.equal(context.fillStyle, '#000000')
    assert.equal(context.strokeStyle, '#000000')
    assert.equal(context.font, '10px sans-serif')
    assert.strictEqual(context.getImageData(0, 0, 1, 1).data.join(','), '0,0,0,0')
  })

  it('Canvas#width= (resurfacing) doesn\'t crash when fillStyle is a pattern (#1357)', function (done) {
    const canvas = createCanvas(100, 200)
    const ctx = canvas.getContext('2d')

    loadImage(path.join(__dirname, '/fixtures/checkers.png')).then(img => {
      const pattern = ctx.createPattern(img, 'repeat')
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, 300, 300)
      canvas.width = 200 // cause canvas to resurface
      done()
    })
  })

  it('SVG Canvas#width changes don\'t crash (#1380)', function () {
    const myCanvas = createCanvas(100, 100, 'svg')
    myCanvas.width = 120
  })

  it('Canvas#stride', function () {
    const canvas = createCanvas(24, 10)
    assert.ok(canvas.stride >= 24, 'canvas.stride is too short')
    assert.ok(canvas.stride < 1024, 'canvas.stride seems too long')

    // TODO test stride on other formats
  })

  it('Canvas#getContext("invalid")', function () {
    assert.equal(null, createCanvas(200, 300).getContext('invalid'))
  })

  it('Context2d#patternQuality', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal('good', ctx.patternQuality)
    ctx.patternQuality = 'best'
    assert.equal('best', ctx.patternQuality)
    ctx.patternQuality = 'invalid'
    assert.equal('best', ctx.patternQuality)
  })

  it('Context2d#imageSmoothingEnabled', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal(true, ctx.imageSmoothingEnabled)
    ctx.imageSmoothingEnabled = false
    assert.equal('good', ctx.patternQuality)
    assert.equal(false, ctx.imageSmoothingEnabled)
    assert.equal('good', ctx.patternQuality)
  })

  it('Context2d#font=', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal(ctx.font, '10px sans-serif')
    ctx.font = '15px Arial, sans-serif'
    assert.equal(ctx.font, '15px Arial, sans-serif')

    ctx.font = 'Helvetica, sans' // invalid
    assert.equal(ctx.font, '15px Arial, sans-serif')
  })

  it('Context2d#lineWidth=', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    ctx.lineWidth = 10.0
    assert.equal(10, ctx.lineWidth)
    ctx.lineWidth = Infinity
    assert.equal(10, ctx.lineWidth)
    ctx.lineWidth = -Infinity
    assert.equal(10, ctx.lineWidth)
    ctx.lineWidth = -5
    assert.equal(10, ctx.lineWidth)
    ctx.lineWidth = 0
    assert.equal(10, ctx.lineWidth)
  })

  it('Context2d#antiAlias=', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal('default', ctx.antialias)
    ctx.antialias = 'none'
    assert.equal('none', ctx.antialias)
    ctx.antialias = 'gray'
    assert.equal('gray', ctx.antialias)
    ctx.antialias = 'subpixel'
    assert.equal('subpixel', ctx.antialias)
    ctx.antialias = 'invalid'
    assert.equal('subpixel', ctx.antialias)
    ctx.antialias = 1
    assert.equal('subpixel', ctx.antialias)
  })

  it('Context2d#lineCap=', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal('butt', ctx.lineCap)
    ctx.lineCap = 'round'
    assert.equal('round', ctx.lineCap)
  })

  it('Context2d#lineJoin=', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal('miter', ctx.lineJoin)
    ctx.lineJoin = 'round'
    assert.equal('round', ctx.lineJoin)
  })

  it('Context2d#globalAlpha=', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal(1, ctx.globalAlpha)
    ctx.globalAlpha = 0.5
    assert.equal(0.5, ctx.globalAlpha)
  })

  it('Context2d#isPointInPath()', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    ctx.rect(5, 5, 100, 100)
    ctx.rect(50, 100, 10, 10)
    assert.ok(ctx.isPointInPath(10, 10))
    assert.ok(ctx.isPointInPath(10, 50))
    assert.ok(ctx.isPointInPath(100, 100))
    assert.ok(ctx.isPointInPath(105, 105))
    assert.ok(!ctx.isPointInPath(106, 105))
    assert.ok(!ctx.isPointInPath(150, 150))

    assert.ok(ctx.isPointInPath(50, 110))
    assert.ok(ctx.isPointInPath(60, 110))
    assert.ok(!ctx.isPointInPath(70, 110))
    assert.ok(!ctx.isPointInPath(50, 120))
  })

  it('Context2d#textAlign', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal('left', ctx.textAlign) // default TODO wrong default
    ctx.textAlign = 'start'
    assert.equal('start', ctx.textAlign)
    ctx.textAlign = 'center'
    assert.equal('center', ctx.textAlign)
    ctx.textAlign = 'right'
    assert.equal('right', ctx.textAlign)
    ctx.textAlign = 'end'
    assert.equal('end', ctx.textAlign)
    ctx.textAlign = 'fail'
    assert.equal('end', ctx.textAlign)
  })

  describe('#toBuffer', function () {
    it('Canvas#toBuffer()', function () {
      const buf = createCanvas(200, 200).toBuffer()
      assert.equal('PNG', buf.slice(1, 4).toString())
    })

    it('Canvas#toBuffer("image/png")', function () {
      const buf = createCanvas(200, 200).toBuffer('image/png')
      assert.equal('PNG', buf.slice(1, 4).toString())
    })

    it('Canvas#toBuffer("image/png", {resolution: 96})', function () {
      const buf = createCanvas(200, 200).toBuffer('image/png', { resolution: 96 })
      // 3780 ppm ~= 96 ppi
      let foundpHYs = false
      for (let i = 0; i < buf.length - 12; i++) {
        if (buf[i] === 0x70 &&
          buf[i + 1] === 0x48 &&
          buf[i + 2] === 0x59 &&
          buf[i + 3] === 0x73) { // pHYs
          foundpHYs = true
          assert.equal(buf[i + 4], 0)
          assert.equal(buf[i + 5], 0)
          assert.equal(buf[i + 6], 0x0e)
          assert.equal(buf[i + 7], 0xc4) // x
          assert.equal(buf[i + 8], 0)
          assert.equal(buf[i + 9], 0)
          assert.equal(buf[i + 10], 0x0e)
          assert.equal(buf[i + 11], 0xc4) // y
        }
      }
      assert.ok(foundpHYs, 'missing pHYs header')
    })

    it('Canvas#toBuffer("image/png", {compressionLevel: 5})', function () {
      const buf = createCanvas(200, 200).toBuffer('image/png', { compressionLevel: 5 })
      assert.equal('PNG', buf.slice(1, 4).toString())
    })

    it('Canvas#toBuffer("image/png", {filters: PNG_ALL_FILTERS})', function () {
      const buf = createCanvas(200, 200).toBuffer('image/png', { filters: Canvas.PNG_ALL_FILTERS })
      assert.equal('PNG', buf.slice(1, 4).toString())
    })

    it('Canvas#toBuffer("image/jpeg")', function () {
      const buf = createCanvas(200, 200).toBuffer('image/jpeg')
      assert.equal(buf[0], 0xff)
      assert.equal(buf[1], 0xd8)
      assert.equal(buf[buf.byteLength - 2], 0xff)
      assert.equal(buf[buf.byteLength - 1], 0xd9)
    })

    it('Canvas#toBuffer("image/jpeg", {quality: 0.95})', function () {
      const buf = createCanvas(200, 200).toBuffer('image/jpeg', { quality: 0.95 })
      assert.equal(buf[0], 0xff)
      assert.equal(buf[1], 0xd8)
      assert.equal(buf[buf.byteLength - 2], 0xff)
      assert.equal(buf[buf.byteLength - 1], 0xd9)
    })

    it('Canvas#toBuffer(callback)', function (done) {
      createCanvas(200, 200).toBuffer(function (err, buf) {
        assert.ok(!err)
        assert.equal('PNG', buf.slice(1, 4).toString())
        done()
      })
    })

    it('Canvas#toBuffer(callback, "image/jpeg")', function (done) {
      createCanvas(200, 200).toBuffer(function (err, buf) {
        assert.ok(!err)
        assert.equal(buf[0], 0xff)
        assert.equal(buf[1], 0xd8)
        assert.equal(buf[buf.byteLength - 2], 0xff)
        assert.equal(buf[buf.byteLength - 1], 0xd9)
        done()
      }, 'image/jpeg')
    })

    it('Canvas#toBuffer(callback, "image/jpeg", {quality: 0.95})', function (done) {
      createCanvas(200, 200).toBuffer(function (err, buf) {
        assert.ok(!err)
        assert.equal(buf[0], 0xff)
        assert.equal(buf[1], 0xd8)
        assert.equal(buf[buf.byteLength - 2], 0xff)
        assert.equal(buf[buf.byteLength - 1], 0xd9)
        done()
      }, 'image/jpeg', { quality: 0.95 })
    })

    describe('#toBuffer("raw")', function () {
      const canvas = createCanvas(11, 10)
      const ctx = canvas.getContext('2d')

      ctx.clearRect(0, 0, 11, 10)

      ctx.fillStyle = 'rgba(200, 200, 200, 0.505)'
      ctx.fillRect(0, 0, 5, 5)

      ctx.fillStyle = 'red'
      ctx.fillRect(5, 0, 5, 5)

      ctx.fillStyle = '#00ff00'
      ctx.fillRect(0, 5, 5, 5)

      ctx.fillStyle = 'black'
      ctx.fillRect(5, 5, 4, 5)

      /** Output:
       *    *****RRRRR-
       *    *****RRRRR-
       *    *****RRRRR-
       *    *****RRRRR-
       *    *****RRRRR-
       *    GGGGGBBBB--
       *    GGGGGBBBB--
       *    GGGGGBBBB--
       *    GGGGGBBBB--
       *    GGGGGBBBB--
       */

      const buf = canvas.toBuffer('raw')
      const stride = canvas.stride

      const endianness = os.endianness()

      function assertPixel (u32, x, y, message) {
        const expected = '0x' + u32.toString(16)

        // Buffer doesn't have readUInt32(): it only has readUInt32LE() and
        // readUInt32BE().
        const px = buf['readUInt32' + endianness](y * stride + x * 4)
        const actual = '0x' + px.toString(16)

        assert.equal(actual, expected, message)
      }

      it('should have the correct size', function () {
        assert.equal(buf.length, stride * 10)
      })

      it('does not premultiply alpha', function () {
        assertPixel(0x80646464, 0, 0, 'first semitransparent pixel')
        assertPixel(0x80646464, 4, 4, 'last semitransparent pixel')
      })

      it('draws red', function () {
        assertPixel(0xffff0000, 5, 0, 'first red pixel')
        assertPixel(0xffff0000, 9, 4, 'last red pixel')
      })

      it('draws green', function () {
        assertPixel(0xff00ff00, 0, 5, 'first green pixel')
        assertPixel(0xff00ff00, 4, 9, 'last green pixel')
      })

      it('draws black', function () {
        assertPixel(0xff000000, 5, 5, 'first black pixel')
        assertPixel(0xff000000, 8, 9, 'last black pixel')
      })

      it('leaves undrawn pixels black, transparent', function () {
        assertPixel(0x0, 9, 5, 'first undrawn pixel')
        assertPixel(0x0, 9, 9, 'last undrawn pixel')
      })

      it('is immutable', function () {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, 10, 10)
        canvas.toBuffer('raw') // (side-effect: flushes canvas)
        assertPixel(0xffff0000, 5, 0, 'first red pixel')
      })
    })
  })

  describe('#toDataURL()', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    ctx.fillRect(0, 0, 100, 100)
    ctx.fillStyle = 'red'
    ctx.fillRect(100, 0, 100, 100)

    it('toDataURL() works and defaults to PNG', function () {
      assert.ok(canvas.toDataURL().startsWith('data:image/png;base64,'))
    })

    it('toDataURL(0.5) works and defaults to PNG', function () {
      assert.ok(canvas.toDataURL(0.5).startsWith('data:image/png;base64,'))
    })

    it('toDataURL(undefined) works and defaults to PNG', function () {
      assert.ok(canvas.toDataURL(undefined).startsWith('data:image/png;base64,'))
    })

    it('toDataURL("image/png") works', function () {
      assert.ok(canvas.toDataURL('image/png').startsWith('data:image/png;base64,'))
    })

    it('toDataURL("image/png", 0.5) works', function () {
      assert.ok(canvas.toDataURL('image/png').startsWith('data:image/png;base64,'))
    })

    it('toDataURL("iMaGe/PNg") works', function () {
      assert.ok(canvas.toDataURL('iMaGe/PNg').startsWith('data:image/png;base64,'))
    })

    it('toDataURL("image/jpeg") works', function () {
      assert.ok(canvas.toDataURL('image/jpeg').startsWith('data:image/jpeg;base64,'))
    })

    it('toDataURL(function (err, str) {...}) works and defaults to PNG', function (done) {
      createCanvas(200, 200).toDataURL(function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/png;base64,') === 0)
        done()
      })
    })

    it('toDataURL(function (err, str) {...}) is async even with no canvas data', function (done) {
      createCanvas().toDataURL(function (err, str) {
        assert.ifError(err)
        assert.ok(str === 'data:,')
        done()
      })
    })

    it('toDataURL(0.5, function (err, str) {...}) works and defaults to PNG', function (done) {
      createCanvas(200, 200).toDataURL(0.5, function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/png;base64,') === 0)
        done()
      })
    })

    it('toDataURL(undefined, function (err, str) {...}) works and defaults to PNG', function (done) {
      createCanvas(200, 200).toDataURL(undefined, function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/png;base64,') === 0)
        done()
      })
    })

    it('toDataURL("image/png", function (err, str) {...}) works', function (done) {
      createCanvas(200, 200).toDataURL('image/png', function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/png;base64,') === 0)
        done()
      })
    })

    it('toDataURL("image/png", 0.5, function (err, str) {...}) works', function (done) {
      createCanvas(200, 200).toDataURL('image/png', 0.5, function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/png;base64,') === 0)
        done()
      })
    })

    it('toDataURL("image/png", {}) works', function () {
      assert.ok(canvas.toDataURL('image/png', {}).startsWith('data:image/png;base64,'))
    })

    it('toDataURL("image/jpeg", {}) works', function () {
      assert.ok(canvas.toDataURL('image/jpeg', {}).startsWith('data:image/jpeg;base64,'))
    })

    it('toDataURL("image/jpeg", function (err, str) {...}) works', function (done) {
      createCanvas(200, 200).toDataURL('image/jpeg', function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/jpeg;base64,') === 0)
        done()
      })
    })

    it('toDataURL("iMAge/JPEG", function (err, str) {...}) works', function (done) {
      createCanvas(200, 200).toDataURL('iMAge/JPEG', function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/jpeg;base64,') === 0)
        done()
      })
    })

    it('toDataURL("image/jpeg", undefined, function (err, str) {...}) works', function (done) {
      createCanvas(200, 200).toDataURL('image/jpeg', undefined, function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/jpeg;base64,') === 0)
        done()
      })
    })

    it('toDataURL("image/jpeg", 0.5, function (err, str) {...}) works', function (done) {
      createCanvas(200, 200).toDataURL('image/jpeg', 0.5, function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/jpeg;base64,') === 0)
        done()
      })
    })

    it('toDataURL("image/jpeg", opts, function (err, str) {...}) works', function (done) {
      createCanvas(200, 200).toDataURL('image/jpeg', { quality: 100 }, function (err, str) {
        assert.ifError(err)
        assert.ok(str.indexOf('data:image/jpeg;base64,') === 0)
        done()
      })
    })
  })

  describe('Context2d#createImageData(width, height)', function () {
    it('works', function () {
      const canvas = createCanvas(20, 20)
      const ctx = canvas.getContext('2d')

      const imageData = ctx.createImageData(2, 6)
      assert.equal(2, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(2 * 6 * 4, imageData.data.length)

      assert.equal(0, imageData.data[0])
      assert.equal(0, imageData.data[1])
      assert.equal(0, imageData.data[2])
      assert.equal(0, imageData.data[3])
    })

    it('works, A8 format', function () {
      const canvas = createCanvas(20, 20)
      const ctx = canvas.getContext('2d', { pixelFormat: 'A8' })

      const imageData = ctx.createImageData(2, 6)
      assert.equal(2, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(2 * 6 * 1, imageData.data.length)

      assert.equal(0, imageData.data[0])
      assert.equal(0, imageData.data[1])
      assert.equal(0, imageData.data[2])
      assert.equal(0, imageData.data[3])
    })

    it('works, A1 format', function () {
      const canvas = createCanvas(20, 20)
      const ctx = canvas.getContext('2d', { pixelFormat: 'A1' })

      const imageData = ctx.createImageData(2, 6)
      assert.equal(2, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(Math.ceil(2 * 6 / 8), imageData.data.length)

      assert.equal(0, imageData.data[0])
      assert.equal(0, imageData.data[1])
    })

    it('works, RGB24 format', function () {
      const canvas = createCanvas(20, 20)
      const ctx = canvas.getContext('2d', { pixelFormat: 'RGB24' })

      const imageData = ctx.createImageData(2, 6)
      assert.equal(2, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(2 * 6 * 4, imageData.data.length)

      assert.equal(0, imageData.data[0])
      assert.equal(0, imageData.data[1])
      assert.equal(0, imageData.data[2])
      assert.equal(0, imageData.data[3])
    })

    it('works, RGB16_565 format', function () {
      const canvas = createCanvas(20, 20)
      const ctx = canvas.getContext('2d', { pixelFormat: 'RGB16_565' })

      const imageData = ctx.createImageData(2, 6)
      assert(imageData.data instanceof Uint16Array)
      assert.equal(2, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(2 * 6, imageData.data.length)

      assert.equal(0, imageData.data[0])
      assert.equal(0, imageData.data[1])
    })
  })

  describe('Context2d#measureText()', function () {
    it('Context2d#measureText().width', function () {
      const canvas = createCanvas(20, 20)
      const ctx = canvas.getContext('2d')

      assert.ok(ctx.measureText('foo').width)
      assert.ok(ctx.measureText('foo').width !== ctx.measureText('foobar').width)
      assert.ok(ctx.measureText('foo').width !== ctx.measureText('  foo').width)
    })

    it('works', function () {
      const canvas = createCanvas(20, 20)
      const ctx = canvas.getContext('2d')
      ctx.font = '20px Arial'

      ctx.textBaseline = 'alphabetic'
      let metrics = ctx.measureText('Alphabet')
      // Actual value depends on font library version. Have observed values
      // between 0 and 0.769.
      assertApprox(metrics.alphabeticBaseline, 0.5, 0.5)
      // Positive = going up from the baseline
      assert.ok(metrics.actualBoundingBoxAscent > 0)
      // Positive = going down from the baseline
      assertApprox(metrics.actualBoundingBoxDescent, 5, 2)

      ctx.textBaseline = 'bottom'
      metrics = ctx.measureText('Alphabet')
      assert.strictEqual(ctx.textBaseline, 'bottom')
      assertApprox(metrics.alphabeticBaseline, 5, 2)
      assert.ok(metrics.actualBoundingBoxAscent > 0)
      // On the baseline or slightly above
      assert.ok(metrics.actualBoundingBoxDescent <= 0)
    })

    it('actualBoundingBox is correct for left, center and right alignment (#1909)', function () {
      const canvas = createCanvas(0, 0)
      const ctx = canvas.getContext('2d')

      // positive actualBoundingBoxLeft indicates a distance going left from the
      // given alignment point.

      // positive actualBoundingBoxRight indicates a distance going right from
      // the given alignment point.

      ctx.textAlign = 'left'
      const lm = ctx.measureText('aaaa')
      assertApprox(lm.actualBoundingBoxLeft, -1, 6)
      assertApprox(lm.actualBoundingBoxRight, 21, 6)

      ctx.textAlign = 'center'
      const cm = ctx.measureText('aaaa')
      assertApprox(cm.actualBoundingBoxLeft, 9, 6)
      assertApprox(cm.actualBoundingBoxRight, 11, 6)

      ctx.textAlign = 'right'
      const rm = ctx.measureText('aaaa')
      assertApprox(rm.actualBoundingBoxLeft, 19, 6)
      assertApprox(rm.actualBoundingBoxRight, 1, 6)
    })
  })

  it('Context2d#fillText()', function () {
    [
      [['A', 10, 10], true],
      [['A', 10, 10, undefined], true],
      [['A', 10, 10, NaN], false]
    ].forEach(([args, shouldDraw]) => {
      const canvas = createCanvas(20, 20)
      const ctx = canvas.getContext('2d')

      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      ctx.fillText(...args)

      assert.strictEqual(ctx.getImageData(0, 0, 20, 20).data.some(a => a), shouldDraw)
    })
  })

  it('Context2d#currentTransform', function () {
    const canvas = createCanvas(20, 20)
    const ctx = canvas.getContext('2d')

    ctx.scale(0.1, 0.3)
    const mat1 = ctx.currentTransform
    assert.equal(mat1.a, 0.1)
    assert.equal(mat1.b, 0)
    assert.equal(mat1.c, 0)
    assert.equal(mat1.d, 0.3)
    assert.equal(mat1.e, 0)
    assert.equal(mat1.f, 0)

    ctx.resetTransform()
    const mat2 = ctx.currentTransform
    assert.equal(mat2.a, 1)
    assert.equal(mat2.d, 1)

    ctx.currentTransform = mat1
    const mat3 = ctx.currentTransform
    assert.equal(mat3.a, 0.1)
    assert.equal(mat3.d, 0.3)

    assert.deepEqual(ctx.currentTransform, ctx.getTransform())

    ctx.setTransform(ctx.getTransform())
    assert.deepEqual(mat3, ctx.getTransform())

    ctx.setTransform(mat3.a, mat3.b, mat3.c, mat3.d, mat3.e, mat3.f)
    assert.deepEqual(mat3, ctx.getTransform())
  })

  it('Context2d#createImageData(ImageData)', function () {
    const canvas = createCanvas(20, 20)
    const ctx = canvas.getContext('2d')

    const imageData = ctx.createImageData(ctx.createImageData(2, 6))
    assert.equal(2, imageData.width)
    assert.equal(6, imageData.height)
    assert.equal(2 * 6 * 4, imageData.data.length)
  })

  describe('Context2d#getImageData()', function () {
    function createTestCanvas (useAlpha, attributes) {
      const canvas = createCanvas(3, 6)
      const ctx = canvas.getContext('2d', attributes)

      ctx.fillStyle = useAlpha ? 'rgba(255,0,0,0.25)' : '#f00'
      ctx.fillRect(0, 0, 1, 6)

      ctx.fillStyle = useAlpha ? 'rgba(0,255,0,0.5)' : '#0f0'
      ctx.fillRect(1, 0, 1, 6)

      ctx.fillStyle = useAlpha ? 'rgba(0,0,255,0.75)' : '#00f'
      ctx.fillRect(2, 0, 1, 6)

      return ctx
    }

    it('works, full width, RGBA32', function () {
      const ctx = createTestCanvas()
      const imageData = ctx.getImageData(0, 0, 3, 6)

      assert.equal(3, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(3 * 6 * 4, imageData.data.length)

      assert.equal(255, imageData.data[0])
      assert.equal(0, imageData.data[1])
      assert.equal(0, imageData.data[2])
      assert.equal(255, imageData.data[3])

      assert.equal(0, imageData.data[4])
      assert.equal(255, imageData.data[5])
      assert.equal(0, imageData.data[6])
      assert.equal(255, imageData.data[7])

      assert.equal(0, imageData.data[8])
      assert.equal(0, imageData.data[9])
      assert.equal(255, imageData.data[10])
      assert.equal(255, imageData.data[11])
    })

    it('works, full width, RGB24', function () {
      const ctx = createTestCanvas(false, { pixelFormat: 'RGB24' })
      const imageData = ctx.getImageData(0, 0, 3, 6)
      assert.equal(3, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(3 * 6 * 4, imageData.data.length)

      assert.equal(255, imageData.data[0])
      assert.equal(0, imageData.data[1])
      assert.equal(0, imageData.data[2])
      assert.equal(255, imageData.data[3])

      assert.equal(0, imageData.data[4])
      assert.equal(255, imageData.data[5])
      assert.equal(0, imageData.data[6])
      assert.equal(255, imageData.data[7])

      assert.equal(0, imageData.data[8])
      assert.equal(0, imageData.data[9])
      assert.equal(255, imageData.data[10])
      assert.equal(255, imageData.data[11])
    })

    it('works, full width, RGB16_565', function () {
      const ctx = createTestCanvas(false, { pixelFormat: 'RGB16_565' })
      const imageData = ctx.getImageData(0, 0, 3, 6)
      assert.equal(3, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(3 * 6, imageData.data.length)

      assert.equal((255 & 0b11111) << 11, imageData.data[0])
      assert.equal((255 & 0b111111) << 5, imageData.data[1])
      assert.equal((255 & 0b11111), imageData.data[2])

      assert.equal((255 & 0b11111) << 11, imageData.data[3])
      assert.equal((255 & 0b111111) << 5, imageData.data[4])
      assert.equal((255 & 0b11111), imageData.data[5])
    })

    it('works, full width, A8', function () {
      const ctx = createTestCanvas(true, { pixelFormat: 'A8' })
      const imageData = ctx.getImageData(0, 0, 3, 6)
      assert.equal(3, imageData.width)
      assert.equal(6, imageData.height)
      assert.equal(3 * 6, imageData.data.length)

      assert.equal(63, imageData.data[0])
      assert.equal(127, imageData.data[1])
      assert.equal(191, imageData.data[2])

      assert.equal(63, imageData.data[3])
      assert.equal(127, imageData.data[4])
      assert.equal(191, imageData.data[5])
    })

    it('works, full width, A1')

    it('works, full width, RGB30')

    it('works, slice, RGBA32', function () {
      const ctx = createTestCanvas()
      const imageData = ctx.getImageData(0, 0, 2, 1)
      assert.equal(2, imageData.width)
      assert.equal(1, imageData.height)
      assert.equal(8, imageData.data.length)

      assert.equal(255, imageData.data[0])
      assert.equal(0, imageData.data[1])
      assert.equal(0, imageData.data[2])
      assert.equal(255, imageData.data[3])

      assert.equal(0, imageData.data[4])
      assert.equal(255, imageData.data[5])
      assert.equal(0, imageData.data[6])
      assert.equal(255, imageData.data[7])
    })

    it('works, slice, RGB24', function () {
      const ctx = createTestCanvas(false, { pixelFormat: 'RGB24' })
      const imageData = ctx.getImageData(0, 0, 2, 1)
      assert.equal(2, imageData.width)
      assert.equal(1, imageData.height)
      assert.equal(8, imageData.data.length)

      assert.equal(255, imageData.data[0])
      assert.equal(0, imageData.data[1])
      assert.equal(0, imageData.data[2])
      assert.equal(255, imageData.data[3])

      assert.equal(0, imageData.data[4])
      assert.equal(255, imageData.data[5])
      assert.equal(0, imageData.data[6])
      assert.equal(255, imageData.data[7])
    })

    it('works, slice, RGB16_565', function () {
      const ctx = createTestCanvas(false, { pixelFormat: 'RGB16_565' })
      const imageData = ctx.getImageData(0, 0, 2, 1)
      assert.equal(2, imageData.width)
      assert.equal(1, imageData.height)
      assert.equal(2 * 1, imageData.data.length)

      assert.equal((255 & 0b11111) << 11, imageData.data[0])
      assert.equal((255 & 0b111111) << 5, imageData.data[1])
    })

    it('works, slice, A8', function () {
      const ctx = createTestCanvas(true, { pixelFormat: 'A8' })
      const imageData = ctx.getImageData(0, 0, 2, 1)
      assert.equal(2, imageData.width)
      assert.equal(1, imageData.height)
      assert.equal(2 * 1, imageData.data.length)

      assert.equal(63, imageData.data[0])
      assert.equal(127, imageData.data[1])
    })

    it('works, slice, A1')

    it('works, slice, RGB30')

    it('works, assignment', function () {
      const ctx = createTestCanvas()
      const data = ctx.getImageData(0, 0, 5, 5).data
      data[0] = 50
      assert.equal(50, data[0])
      data[0] = 280
      assert.equal(255, data[0])
      data[0] = -4444
      assert.equal(0, data[0])
    })

    it('throws if indexes are invalid', function () {
      const ctx = createTestCanvas()
      assert.throws(function () { ctx.getImageData(0, 0, 0, 0) }, /IndexSizeError/)
    })

    it('throws if canvas is a PDF canvas (#1853)', function () {
      const canvas = createCanvas(3, 6, 'pdf')
      const ctx = canvas.getContext('2d')
      assert.throws(() => {
        ctx.getImageData(0, 0, 3, 6)
      })
    })
  })

  it('Context2d#createPattern(Canvas)', function () {
    let pattern = createCanvas(2, 2)
    const checkers = pattern.getContext('2d')

    // white
    checkers.fillStyle = '#fff'
    checkers.fillRect(0, 0, 2, 2)

    // black
    checkers.fillStyle = '#000'
    checkers.fillRect(0, 0, 1, 1)
    checkers.fillRect(1, 1, 1, 1)

    let imageData = checkers.getImageData(0, 0, 2, 2)
    assert.equal(2, imageData.width)
    assert.equal(2, imageData.height)
    assert.equal(16, imageData.data.length)

    // (0,0) black
    assert.equal(0, imageData.data[0])
    assert.equal(0, imageData.data[1])
    assert.equal(0, imageData.data[2])
    assert.equal(255, imageData.data[3])

    // (1,0) white
    assert.equal(255, imageData.data[4])
    assert.equal(255, imageData.data[5])
    assert.equal(255, imageData.data[6])
    assert.equal(255, imageData.data[7])

    // (0,1) white
    assert.equal(255, imageData.data[8])
    assert.equal(255, imageData.data[9])
    assert.equal(255, imageData.data[10])
    assert.equal(255, imageData.data[11])

    // (1,1) black
    assert.equal(0, imageData.data[12])
    assert.equal(0, imageData.data[13])
    assert.equal(0, imageData.data[14])
    assert.equal(255, imageData.data[15])

    const canvas = createCanvas(20, 20)
    const ctx = canvas.getContext('2d')
    pattern = ctx.createPattern(pattern)

    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, 20, 20)

    imageData = ctx.getImageData(0, 0, 20, 20)
    assert.equal(20, imageData.width)
    assert.equal(20, imageData.height)
    assert.equal(1600, imageData.data.length)

    let i = 0; let b = true
    while (i < imageData.data.length) {
      if (b) {
        assert.equal(0, imageData.data[i++])
        assert.equal(0, imageData.data[i++])
        assert.equal(0, imageData.data[i++])
        assert.equal(255, imageData.data[i++])
      } else {
        assert.equal(255, imageData.data[i++])
        assert.equal(255, imageData.data[i++])
        assert.equal(255, imageData.data[i++])
        assert.equal(255, imageData.data[i++])
      }
      // alternate b, except when moving to a new row
      b = i % (imageData.width * 4) === 0 ? b : !b
    }
  })

  it('Context2d#createPattern(Canvas).setTransform()', function () {
    const DOMMatrix = require('../').DOMMatrix;

    // call func with an ImageData-offset and pixel color value appropriate for a 4-quadrant pattern within
    // the width and height that's white in the upper-left & lower-right and black in the other corners
    function eachPixel(bmp, func){
      let {width, height} = bmp;
      for (let x=0; x<width; x++){
        for (let y=0; y<height; y++){
          let i = y*4*width + x*4,
              clr = (x<width/2 && y<height/2 || x>=width/2 && y>=height/2) ? 255 : 0;
          func(i, clr);
        }
      }
    }

    // create a canvas with a single repeat of the pattern within its dims
    function makeCheckerboard(w, h){
      let check = createCanvas(w, h),
          ctx = check.getContext('2d'),
          bmp = ctx.createImageData(w, h);
      eachPixel(bmp, (i, clr) => bmp.data.set([clr,clr,clr, 255], i));
      ctx.putImageData(bmp, 0, 0);
      return check;
    }

    // verify that the region looks like a single 4-quadrant checkerboard cell
    function isCheckerboard(ctx, w, h){
      let bmp = ctx.getImageData(0, 0, w, h);
      eachPixel(bmp, (i, clr) => {
        let [r, g, b, a] = bmp.data.slice(i, i+4);
        assert.ok(r==clr && g==clr && b==clr && a==255);
      })
    }

    let w = 160, h = 160,
        canvas = createCanvas(w, h),
        ctx = canvas.getContext('2d'),
        pat = ctx.createPattern(makeCheckerboard(w, h), 'repeat'),
        mat = new DOMMatrix();

    ctx.patternQuality='nearest';
    ctx.fillStyle = pat;

    // draw a single repeat of the pattern at each scale and then confirm that
    // the transformation succeeded
    [1, .5, .25, .125, 0.0625].forEach(mag => {
      mat = new DOMMatrix().scale(mag);
      pat.setTransform(mat);
      ctx.fillRect(0,0, w*mag, h*mag);
      isCheckerboard(ctx, w*mag, h*mag);
    })
  });

  it('Context2d#createPattern(Image)', async function () {
    const img = await loadImage(path.join(__dirname, '/fixtures/checkers.png'));
    const canvas = createCanvas(20, 20)
    const ctx = canvas.getContext('2d')
    const pattern = ctx.createPattern(img)

    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, 20, 20)

    const imageData = ctx.getImageData(0, 0, 20, 20)
    assert.equal(20, imageData.width)
    assert.equal(20, imageData.height)
    assert.equal(1600, imageData.data.length)

    let i = 0; let b = true
    while (i < imageData.data.length) {
      if (b) {
        assert.equal(0, imageData.data[i++])
        assert.equal(0, imageData.data[i++])
        assert.equal(0, imageData.data[i++])
        assert.equal(255, imageData.data[i++])
      } else {
        assert.equal(255, imageData.data[i++])
        assert.equal(255, imageData.data[i++])
        assert.equal(255, imageData.data[i++])
        assert.equal(255, imageData.data[i++])
      }
      // alternate b, except when moving to a new row
      b = i % (imageData.width * 4) === 0 ? b : !b
    }
  })

  it('CanvasPattern stringifies as [object CanvasPattern]', async function () {
    const img = await loadImage(path.join(__dirname, '/fixtures/checkers.png'));
    const canvas = createCanvas(20, 20)
    const ctx = canvas.getContext('2d')
    const pattern = ctx.createPattern(img)
    assert.strictEqual(pattern.toString(), '[object CanvasPattern]')
  })

  it('CanvasPattern has class string of `CanvasPattern`', async function () {
    const img = await loadImage(path.join(__dirname, '/fixtures/checkers.png'));
    const canvas = createCanvas(20, 20)
    const ctx = canvas.getContext('2d')
    const pattern = ctx.createPattern(img)
    assert.strictEqual(Object.prototype.toString.call(pattern), '[object CanvasPattern]')
  })

  it('Context2d#createLinearGradient()', function () {
    const canvas = createCanvas(20, 1)
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(1, 1, 19, 1)

    gradient.addColorStop(0, '#fff')
    gradient.addColorStop(1, '#000')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 20, 1)

    const imageData = ctx.getImageData(0, 0, 20, 1)
    assert.equal(20, imageData.width)
    assert.equal(1, imageData.height)
    assert.equal(80, imageData.data.length)

    // (0,0) white
    assert.equal(255, imageData.data[0])
    assert.equal(255, imageData.data[1])
    assert.equal(255, imageData.data[2])
    assert.equal(255, imageData.data[3])

    // (20,0) black
    const i = imageData.data.length - 4
    assert.equal(0, imageData.data[i + 0])
    assert.equal(0, imageData.data[i + 1])
    assert.equal(0, imageData.data[i + 2])
    assert.equal(255, imageData.data[i + 3])
  })
  it('Canvas has class string of `HTMLCanvasElement`', function () {
    const canvas = createCanvas(20, 1)

    assert.strictEqual(Object.prototype.toString.call(canvas), '[object HTMLCanvasElement]')
  })

  it('CanvasGradient stringifies as [object CanvasGradient]', function () {
    const canvas = createCanvas(20, 1)
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(1, 1, 19, 1)
    assert.strictEqual(gradient.toString(), '[object CanvasGradient]')
  })

  it('CanvasGradient has class string of `CanvasGradient`', function () {
    const canvas = createCanvas(20, 1)
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(1, 1, 19, 1)
    assert.strictEqual(Object.prototype.toString.call(gradient), '[object CanvasGradient]')
  })

  describe('Context2d#putImageData()', function () {
    it('throws for invalid arguments', function () {
      const canvas = createCanvas(2, 1)
      const ctx = canvas.getContext('2d')
      assert.throws(function () { ctx.putImageData({}, 0, 0) }, TypeError)
      assert.throws(function () { ctx.putImageData(undefined, 0, 0) }, TypeError)
    })

    it('throws if canvas is a PDF canvas (#1853)', function () {
      const canvas = createCanvas(3, 6, 'pdf')
      const ctx = canvas.getContext('2d')
      const srcImageData = createImageData(new Uint8ClampedArray([
        1, 2, 3, 255, 5, 6, 7, 255,
        0, 1, 2, 255, 4, 5, 6, 255
      ]), 2)
      assert.throws(() => {
        ctx.putImageData(srcImageData, -1, -1)
      })
    })

    it('works for negative source values', function () {
      const canvas = createCanvas(2, 2)
      const ctx = canvas.getContext('2d')
      const srcImageData = createImageData(new Uint8ClampedArray([
        1, 2, 3, 255, 5, 6, 7, 255,
        0, 1, 2, 255, 4, 5, 6, 255
      ]), 2)

      ctx.putImageData(srcImageData, -1, -1)

      const resImageData = ctx.getImageData(0, 0, 2, 2)
      assert.deepEqual(resImageData.data, new Uint8ClampedArray([
        4, 5, 6, 255, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0
      ]))
    })

    it('works, RGBA32', function () {
      const canvas = createCanvas(2, 1)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#f00'
      ctx.fillRect(0, 0, 1, 1)

      // Copy left pixel to the right pixel
      ctx.putImageData(ctx.getImageData(0, 0, 1, 1), 1, 0)

      const pixel = ctx.getImageData(1, 0, 1, 1)

      assert.equal(pixel.data[0], 255)
      assert.equal(pixel.data[1], 0)
      assert.equal(pixel.data[2], 0)
      assert.equal(pixel.data[3], 255)
    })

    it('works, RGB24/alpha:false', function () {
      const canvas = createCanvas(2, 1)
      const ctx = canvas.getContext('2d', { pixelFormat: 'RGB24' })
      ctx.fillStyle = '#f00'
      ctx.fillRect(0, 0, 1, 1)

      // Copy left pixel to the right pixel
      ctx.putImageData(ctx.getImageData(0, 0, 1, 1), 1, 0)

      const pixel = ctx.getImageData(1, 0, 1, 1)

      assert.equal(pixel.data[0], 255)
      assert.equal(pixel.data[1], 0)
      assert.equal(pixel.data[2], 0)
      assert.equal(pixel.data[3], 255)
    })

    it('works, A8', function () {
      const canvas = createCanvas(2, 1)
      const ctx = canvas.getContext('2d', { pixelFormat: 'A8' })

      const imgData = ctx.getImageData(0, 0, 2, 1)
      imgData.data[0] = 4
      imgData.data[1] = 21
      ctx.putImageData(imgData, 0, 0)

      const pixel = ctx.getImageData(0, 0, 2, 1)

      assert.equal(pixel.data[0], 4)
      assert.equal(pixel.data[1], 21)
    })

    it('works, RGB16_565', function () {
      const canvas = createCanvas(2, 1)
      const ctx = canvas.getContext('2d', { pixelFormat: 'RGB16_565' })

      const imgData = ctx.getImageData(0, 0, 2, 1)
      imgData.data[0] = 65535 // 2**16 - 1
      imgData.data[1] = 65500
      ctx.putImageData(imgData, 0, 0)

      const pixel = ctx.getImageData(0, 0, 2, 1)

      assert.equal(pixel.data[0], 65535)
      assert.equal(pixel.data[1], 65500)
    })
  })

  it('Canvas#createPNGStream()', function (done) {
    const canvas = createCanvas(20, 20)
    const stream = canvas.createPNGStream()
    assert(stream instanceof Readable)
    let firstChunk = true
    stream.on('data', function (chunk) {
      if (firstChunk) {
        firstChunk = false
        assert.equal('PNG', chunk.slice(1, 4).toString())
      }
    })
    stream.on('end', function () {
      done()
    })
    stream.on('error', function (err) {
      done(err)
    })
  })

  it('Canvas#createPDFStream()', function (done) {
    const canvas = createCanvas(20, 20, 'pdf')
    const stream = canvas.createPDFStream()
    assert(stream instanceof Readable)
    let firstChunk = true
    stream.on('data', function (chunk) {
      if (firstChunk) {
        firstChunk = false
        assert.equal(chunk.slice(1, 4).toString(), 'PDF')
      }
    })
    stream.on('end', function () {
      done()
    })
    stream.on('error', function (err) {
      done(err)
    })
  })

  it('Canvas#createJPEGStream()', function (done) {
    const canvas = createCanvas(640, 480)
    const stream = canvas.createJPEGStream()
    assert(stream instanceof Readable)
    let firstChunk = true
    let bytes = 0
    stream.on('data', function (chunk) {
      if (firstChunk) {
        firstChunk = false
        assert.equal(0xFF, chunk[0])
        assert.equal(0xD8, chunk[1])
        assert.equal(0xFF, chunk[2])
      }
      bytes += chunk.length
    })
    stream.on('end', function () {
      assert.equal(bytes, 5427)
      done()
    })
    stream.on('error', function (err) {
      done(err)
    })
  })

  // based on https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format
  // end of image marker (FF D9) must exist to maintain JPEG standards
  it('EOI at end of Canvas#createJPEGStream()', function (done) {
    const canvas = createCanvas(640, 480)
    const stream = canvas.createJPEGStream()
    const chunks = []
    stream.on('data', function (chunk) {
      chunks.push(chunk)
    })
    stream.on('end', function () {
      const lastTwoBytes = chunks.pop().slice(-2)
      assert.equal(0xFF, lastTwoBytes[0])
      assert.equal(0xD9, lastTwoBytes[1])
      done()
    })
    stream.on('error', function (err) {
      done(err)
    })
  })

  it('Context2d#fill()', function () {
    const canvas = createCanvas(2, 2)
    const ctx = canvas.getContext('2d')

    // fill whole canvas with white
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 2, 2)

    let imageData, n

    // black
    ctx.fillStyle = '#000'
    ctx.rect(0, 0, 2, 1)
    ctx.rect(1, 0, 1, 2)

    ctx.fill('evenodd')
    // b | w
    // -----
    // w | b
    imageData = ctx.getImageData(0, 0, 2, 2)
    // (0, 0) black
    n = 0
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (0, 1) white
    n = 1
    assert.equal(imageData.data[n * 4 + 0], 255)
    assert.equal(imageData.data[n * 4 + 1], 255)
    assert.equal(imageData.data[n * 4 + 2], 255)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (1, 0) white
    n = 2
    assert.equal(imageData.data[n * 4 + 0], 255)
    assert.equal(imageData.data[n * 4 + 1], 255)
    assert.equal(imageData.data[n * 4 + 2], 255)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (1, 1) black
    n = 3
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)

    // should not retain previous value 'evenodd'
    ctx.fill()
    // b | b
    // -----
    // w | b
    imageData = ctx.getImageData(0, 0, 2, 2)
    // (0, 0) black
    n = 0
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (0, 1) black
    n = 1
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (1, 0) white
    n = 2
    assert.equal(imageData.data[n * 4 + 0], 255)
    assert.equal(imageData.data[n * 4 + 1], 255)
    assert.equal(imageData.data[n * 4 + 2], 255)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (1, 1) black
    n = 3
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)
  })

  it('Context2d#clip()', function () {
    const canvas = createCanvas(2, 2)
    const ctx = canvas.getContext('2d')

    // fill whole canvas with white
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, 2, 2)

    let imageData, n

    // black
    ctx.fillStyle = '#000'
    ctx.rect(0, 0, 2, 1)
    ctx.rect(1, 0, 1, 2)

    ctx.clip('evenodd')
    ctx.fillRect(0, 0, 2, 2)
    // b | w
    // -----
    // w | b
    imageData = ctx.getImageData(0, 0, 2, 2)
    // (0, 0) black
    n = 0
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (0, 1) white
    n = 1
    assert.equal(imageData.data[n * 4 + 0], 255)
    assert.equal(imageData.data[n * 4 + 1], 255)
    assert.equal(imageData.data[n * 4 + 2], 255)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (1, 0) white
    n = 2
    assert.equal(imageData.data[n * 4 + 0], 255)
    assert.equal(imageData.data[n * 4 + 1], 255)
    assert.equal(imageData.data[n * 4 + 2], 255)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (1, 1) black
    n = 3
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)

    ctx.clip()
    ctx.fillRect(0, 0, 2, 2)
    // b | b
    // -----
    // w | b
    imageData = ctx.getImageData(0, 0, 2, 2)
    // (0, 0) black
    n = 0
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (0, 1) white
    n = 1
    assert.equal(imageData.data[n * 4 + 0], 255)
    assert.equal(imageData.data[n * 4 + 1], 255)
    assert.equal(imageData.data[n * 4 + 2], 255)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (1, 0) white
    n = 2
    assert.equal(imageData.data[n * 4 + 0], 255)
    assert.equal(imageData.data[n * 4 + 1], 255)
    assert.equal(imageData.data[n * 4 + 2], 255)
    assert.equal(imageData.data[n * 4 + 3], 255)
    // (1, 1) black
    n = 3
    assert.equal(imageData.data[n * 4 + 0], 0)
    assert.equal(imageData.data[n * 4 + 1], 0)
    assert.equal(imageData.data[n * 4 + 2], 0)
    assert.equal(imageData.data[n * 4 + 3], 255)
  })

  it('Context2d#IsPointInPath()', function () {
    const canvas = createCanvas(4, 4)
    const ctx = canvas.getContext('2d')

    ctx.rect(0, 0, 4, 2)
    ctx.rect(2, 0, 2, 4)
    ctx.stroke()

    assert.ok(ctx.isPointInPath(1, 1, 'evenodd'))
    assert.ok(!ctx.isPointInPath(3, 1, 'evenodd'))
    assert.ok(ctx.isPointInPath(3, 1))
    assert.ok(!ctx.isPointInPath(1, 3, 'evenodd'))
    assert.ok(ctx.isPointInPath(3, 3, 'evenodd'))
  })

  it('Context2d#rotate(angle)', function () {
    const canvas = createCanvas(4, 4)
    const ctx = canvas.getContext('2d')

    // Number
    ctx.resetTransform()
    testAngle(1.23, 1.23)

    // String
    ctx.resetTransform()
    testAngle('-4.56e-1', -0.456)

    // Boolean
    ctx.resetTransform()
    testAngle(true, 1)

    // Array
    ctx.resetTransform()
    testAngle([7.8], 7.8)

    // Object
    const obj = Object.create(null)
    if (+process.version.match(/\d+/) >= 6) { obj[Symbol.toPrimitive] = function () { return 0.89 } } else { obj.valueOf = function () { return 0.89 } }
    ctx.resetTransform()
    testAngle(obj, 0.89)

    // NaN
    ctx.resetTransform()
    ctx.rotate(0.91)
    testAngle(NaN, 0.91)

    // Infinite value
    ctx.resetTransform()
    ctx.rotate(0.94)
    testAngle(-Infinity, 0.94)

    function testAngle (angle, expected) {
      ctx.rotate(angle)

      const mat = ctx.currentTransform
      const sin = Math.sin(expected)
      const cos = Math.cos(expected)

      assert.ok(Math.abs(mat.m11 - cos) < Number.EPSILON)
      assert.ok(Math.abs(mat.m12 - sin) < Number.EPSILON)
      assert.ok(Math.abs(mat.m21 + sin) < Number.EPSILON)
      assert.ok(Math.abs(mat.m22 - cos) < Number.EPSILON)
    }
  })

  it('Context2d#drawImage()', function () {
    const canvas = createCanvas(500, 500)
    const ctx = canvas.getContext('2d')

    // Drawing canvas to itself
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 500, 500)
    ctx.fillStyle = 'black'
    ctx.fillRect(5, 5, 10, 10)
    ctx.drawImage(canvas, 20, 20)

    let imgd = ctx.getImageData(0, 0, 500, 500)
    let data = imgd.data
    let count = 0

    for (let i = 0; i < 500 * 500 * 4; i += 4) {
      if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) { count++ }
    }

    assert.strictEqual(count, 10 * 10 * 2)

    // Drawing zero-width image
    ctx.drawImage(canvas, 0, 0, 0, 0, 0, 0, 0, 0)
    ctx.drawImage(canvas, 0, 0, 0, 0, 1, 1, 1, 1)
    ctx.drawImage(canvas, 1, 1, 1, 1, 0, 0, 0, 0)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 500, 500)

    imgd = ctx.getImageData(0, 0, 500, 500)
    data = imgd.data
    count = 0

    for (let i = 0; i < 500 * 500 * 4; i += 4) {
      if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) { count++ }
    }

    assert.strictEqual(count, 500 * 500)
  })

  it('Context2d#SetFillColor()', function () {
    const canvas = createCanvas(2, 2)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 2, 2)
    const data = ctx.getImageData(0, 0, 2, 2).data

    data.forEach(function (byte, index) {
      if (index + 1 & 3) { assert.strictEqual(byte, 128) } else { assert.strictEqual(byte, 255) }
    })
  })

  describe('Context2d#save()/restore()', function () {
    // Based on WPT meta:2d.state.saverestore
    const state = [ // non-default values to test with
      ['strokeStyle', '#ff0000'],
      ['fillStyle', '#ff0000'],
      ['globalAlpha', 0.5],
      ['lineWidth', 0.5],
      ['lineCap', 'round'],
      ['lineJoin', 'round'],
      ['miterLimit', 0.5],
      ['shadowOffsetX', 5],
      ['shadowOffsetY', 5],
      ['shadowBlur', 5],
      ['shadowColor', '#ff0000'],
      ['globalCompositeOperation', 'copy'],
      ['font', '25px serif'],
      ['textAlign', 'center'],
      ['textBaseline', 'bottom'],
      // Added vs. WPT
      ['imageSmoothingEnabled', false],
      // ['imageSmoothingQuality', ], // not supported by node-canvas, #2114
      ['lineDashOffset', 1.0],
      // Non-standard properties:
      ['patternQuality', 'best'],
      // ['quality', 'best'], // doesn't do anything, TODO remove
      ['textDrawingMode', 'glyph'],
      ['antialias', 'gray']
    ]

    for (const [k, v] of state) {
      it(`2d.state.saverestore.${k}`, function () {
        const canvas = createCanvas(0, 0)
        const ctx = canvas.getContext('2d')

        // restore() undoes modification:
        let old = ctx[k]
        ctx.save()
        ctx[k] = v
        ctx.restore()
        assert.strictEqual(ctx[k], old)

        // save() doesn't modify the value:
        ctx[k] = v
        old = ctx[k]
        ctx.save()
        assert.strictEqual(ctx[k], old)
        ctx.restore()
      })
    }
  })
})
