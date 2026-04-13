// A subset of node-canvas tests converted to plain javascript that reproes the
// sync gc problem for easier debugging in lldb

'use strict'

/**
 * Module dependencies.
 */
const assert = require('assert')

const {
  createCanvas,
  registerFont,
  Canvas,
  deregisterAllFonts,
} = require('.');

(function () {
  const c = new Canvas(10, 10)
  assert.throws(function () { Canvas.prototype.width }, /invalid argument/i)
  assert(!c.hasOwnProperty('width'))
  assert('width' in c)
  assert('width' in Canvas.prototype)
})();

(function () {
  assert.throws(() => createCanvas(40_000, 100))
  assert.throws(() => createCanvas(4000, 40_000))
  assert.throws(() => createCanvas(40_000, 40_000))
})();

(function () {
  // WebIDL says negative numbers should throw an
  // IndexSizeError, but we skip [EnforceRange]
  const canvas = createCanvas(-0xfffffff1, -0xfffffff1)
  assert.equal(canvas.width, 15)
  assert.equal(canvas.height, 15)
  canvas.width = -0xfffffff2
  canvas.height = -0xfffffff2
  assert.equal(canvas.width, 14)
  assert.equal(canvas.height, 14)
})();

(function () {
  // Minimal test to make sure nothing is thrown
  registerFont('./examples/pfennigFont/Pfennig.ttf', { family: 'Pfennig' })
  registerFont('./examples/pfennigFont/PfennigBold.ttf', { family: 'Pfennig', weight: 'bold' })

  // Test to multi byte file path support
  registerFont('./examples/pfennigFont/pfennigMultiByte🚀.ttf', { family: 'Pfennig' })

  deregisterAllFonts()
})();

(function () {
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
})();

(function () {
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
})();

(function () {
  let canvas = createCanvas(10, 10)
  assert.equal(canvas.type, 'image')
  canvas = createCanvas(10, 10, 'pdf')
  assert.equal(canvas.type, 'pdf')
  canvas = createCanvas(10, 10, 'svg')
  assert.equal(canvas.type, 'svg')
  canvas = createCanvas(10, 10, 'hey')
  assert.equal(canvas.type, 'image')
})();

(function () {
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
})();
