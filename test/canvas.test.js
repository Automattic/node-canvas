/* eslint-env mocha */

'use strict'

/**
 * Module dependencies.
 */

const createCanvas = require('../').createCanvas
const createImageData = require('../').createImageData
const loadImage = require('../').loadImage
const parseFont = require('../').parseFont
const registerFont = require('../').registerFont

const assert = require('assert')
const os = require('os')
const Readable = require('stream').Readable

describe('Canvas', function () {
  it('Prototype and ctor are well-shaped, don\'t hit asserts on accessors (GH-803)', function () {
    const Canvas = require('../').Canvas;
    var c = new Canvas(10, 10);
    assert.throws(function () { Canvas.prototype.width; }, /incompatible receiver/);
    assert(!c.hasOwnProperty('width'));
    assert('width' in c);
    assert(Canvas.prototype.hasOwnProperty('width'));
  });

  it('.parseFont()', function () {
    var tests = [
        '20px Arial'
      , { size: 20, unit: 'px', family: 'Arial' }
      , '20pt Arial'
      , { size: 26.666666666666668, unit: 'pt', family: 'Arial' }
      , '20.5pt Arial'
      , { size: 27.333333333333332, unit: 'pt', family: 'Arial' }
      , '20% Arial'
      , { size: 20, unit: '%', family: 'Arial' } // TODO I think this is a bad assertion - ZB 23-Jul-2017
      , '20mm Arial'
      , { size: 75.59055118110237, unit: 'mm', family: 'Arial' }
      , '20px serif'
      , { size: 20, unit: 'px', family: 'serif' }
      , '20px sans-serif'
      , { size: 20, unit: 'px', family: 'sans-serif' }
      , '20px monospace'
      , { size: 20, unit: 'px', family: 'monospace' }
      , '50px Arial, sans-serif'
      , { size: 50, unit: 'px', family: 'Arial,sans-serif' }
      , 'bold italic 50px Arial, sans-serif'
      , { style: 'italic', weight: 'bold', size: 50, unit: 'px', family: 'Arial,sans-serif' }
      , '50px Helvetica ,  Arial, sans-serif'
      , { size: 50, unit: 'px', family: 'Helvetica,Arial,sans-serif' }
      , '50px "Helvetica Neue", sans-serif'
      , { size: 50, unit: 'px', family: 'Helvetica Neue,sans-serif' }
      , '50px "Helvetica Neue", "foo bar baz" , sans-serif'
      , { size: 50, unit: 'px', family: 'Helvetica Neue,foo bar baz,sans-serif' }
      , "50px 'Helvetica Neue'"
      , { size: 50, unit: 'px', family: 'Helvetica Neue' }
      , 'italic 20px Arial'
      , { size: 20, unit: 'px', style: 'italic', family: 'Arial' }
      , 'oblique 20px Arial'
      , { size: 20, unit: 'px', style: 'oblique', family: 'Arial' }
      , 'normal 20px Arial'
      , { size: 20, unit: 'px', style: 'normal', family: 'Arial' }
      , '300 20px Arial'
      , { size: 20, unit: 'px', weight: '300', family: 'Arial' }
      , '800 20px Arial'
      , { size: 20, unit: 'px', weight: '800', family: 'Arial' }
      , 'bolder 20px Arial'
      , { size: 20, unit: 'px', weight: 'bolder', family: 'Arial' }
      , 'lighter 20px Arial'
      , { size: 20, unit: 'px', weight: 'lighter', family: 'Arial' }
      , 'normal normal normal 16px Impact'
      , { size: 16, unit: 'px', weight: 'normal', family: 'Impact', style: 'normal', variant: 'normal' }
      , 'italic small-caps bolder 16px cursive'
      , { size: 16, unit: 'px', style: 'italic', variant: 'small-caps', weight: 'bolder', family: 'cursive' }
      , '20px "new century schoolbook", serif'
      , { size: 20, unit: 'px', family: 'new century schoolbook,serif' }
      , '20px "Arial bold 300"' // synthetic case with weight keyword inside family
      , { size: 20, unit: 'px', family: 'Arial bold 300', variant: 'normal' }
    ];

    for (var i = 0, len = tests.length; i < len; ++i) {
      var str = tests[i++]
        , expected = tests[i]
        , actual = parseFont(str);

      if (!expected.style) expected.style = 'normal';
      if (!expected.weight) expected.weight = 'normal';
      if (!expected.stretch) expected.stretch = 'normal';
      if (!expected.variant) expected.variant = 'normal';

      assert.deepEqual(actual, expected, 'Failed to parse: ' + str);
    }

    assert.strictEqual(parseFont('Helvetica, sans'), undefined)
  });

  it('registerFont', function () {
    // Minimal test to make sure nothing is thrown
    registerFont('./examples/pfennigFont/Pfennig.ttf', {family: 'Pfennig'})
    registerFont('./examples/pfennigFont/PfennigBold.ttf', {family: 'Pfennig', weight: 'bold'})
  });

  it('color serialization', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    ['fillStyle', 'strokeStyle', 'shadowColor'].forEach(function(prop){
      ctx[prop] = '#FFFFFF';
      assert.equal('#ffffff', ctx[prop], prop + ' #FFFFFF -> #ffffff, got ' + ctx[prop]);

      ctx[prop] = '#FFF';
      assert.equal('#ffffff', ctx[prop], prop + ' #FFF -> #ffffff, got ' + ctx[prop]);

      ctx[prop] = 'rgba(128, 200, 128, 1)';
      assert.equal('#80c880', ctx[prop], prop + ' rgba(128, 200, 128, 1) -> #80c880, got ' + ctx[prop]);

      ctx[prop] = 'rgba(128,80,0,0.5)';
      assert.equal('rgba(128, 80, 0, 0.50)', ctx[prop], prop + ' rgba(128,80,0,0.5) -> rgba(128, 80, 0, 0.5), got ' + ctx[prop]);

      ctx[prop] = 'rgba(128,80,0,0.75)';
      assert.equal('rgba(128, 80, 0, 0.75)', ctx[prop], prop + ' rgba(128,80,0,0.75) -> rgba(128, 80, 0, 0.75), got ' + ctx[prop]);

      if ('shadowColor' == prop) return;

      var grad = ctx.createLinearGradient(0,0,0,150);
      ctx[prop] = grad;
      assert.strictEqual(grad, ctx[prop], prop + ' pattern getter failed');
    });
  });

  it('color parser', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffccaa';
    assert.equal('#ffccaa', ctx.fillStyle);

    ctx.fillStyle = '#FFCCAA';
    assert.equal('#ffccaa', ctx.fillStyle);

    ctx.fillStyle = '#FCA';
    assert.equal('#ffccaa', ctx.fillStyle);

    ctx.fillStyle = '#fff';
    ctx.fillStyle = '#FGG';
    assert.equal('#ff0000', ctx.fillStyle);

    ctx.fillStyle = '#fff';
    ctx.fillStyle = 'afasdfasdf';
    assert.equal('#ffffff', ctx.fillStyle);

    // #rgba and #rrggbbaa
    ctx.fillStyle = '#ffccaa80'
    assert.equal('rgba(255, 204, 170, 0.50)', ctx.fillStyle)

    ctx.fillStyle = '#acf8'
    assert.equal('rgba(170, 204, 255, 0.53)', ctx.fillStyle)

    ctx.fillStyle = '#BEAD'
    assert.equal('rgba(187, 238, 170, 0.87)', ctx.fillStyle)

    ctx.fillStyle = 'rgb(255,255,255)';
    assert.equal('#ffffff', ctx.fillStyle);

    ctx.fillStyle = 'rgb(0,0,0)';
    assert.equal('#000000', ctx.fillStyle);

    ctx.fillStyle = 'rgb( 0  ,   0  ,  0)';
    assert.equal('#000000', ctx.fillStyle);

    ctx.fillStyle = 'rgba( 0  ,   0  ,  0, 1)';
    assert.equal('#000000', ctx.fillStyle);

    ctx.fillStyle = 'rgba( 255, 200, 90, 0.5)';
    assert.equal('rgba(255, 200, 90, 0.50)', ctx.fillStyle);

    ctx.fillStyle = 'rgba( 255, 200, 90, 0.75)';
    assert.equal('rgba(255, 200, 90, 0.75)', ctx.fillStyle);

    ctx.fillStyle = 'rgba( 255, 200, 90, 0.7555)';
    assert.equal('rgba(255, 200, 90, 0.75)', ctx.fillStyle);

    ctx.fillStyle = 'rgba( 255, 200, 90, .7555)';
    assert.equal('rgba(255, 200, 90, 0.75)', ctx.fillStyle);

    ctx.fillStyle = 'rgb(0, 0, 9000)';
    assert.equal('#0000ff', ctx.fillStyle);

    ctx.fillStyle = 'rgba(0, 0, 0, 42.42)';
    assert.equal('#000000', ctx.fillStyle);

    // hsl / hsla tests

    ctx.fillStyle = 'hsl(0, 0%, 0%)';
    assert.equal('#000000', ctx.fillStyle);

    ctx.fillStyle = 'hsl(3600, -10%, -10%)';
    assert.equal('#000000', ctx.fillStyle);

    ctx.fillStyle = 'hsl(10, 100%, 42%)';
    assert.equal('#d62400', ctx.fillStyle);

    ctx.fillStyle = 'hsl(370, 120%, 42%)';
    assert.equal('#d62400', ctx.fillStyle);

    ctx.fillStyle = 'hsl(0, 100%, 100%)';
    assert.equal('#ffffff', ctx.fillStyle);

    ctx.fillStyle = 'hsl(0, 150%, 150%)';
    assert.equal('#ffffff', ctx.fillStyle);

    ctx.fillStyle = 'hsl(237, 76%, 25%)';
    assert.equal('#0f1470', ctx.fillStyle);

    ctx.fillStyle = 'hsl(240, 73%, 25%)';
    assert.equal('#11116e', ctx.fillStyle);

    ctx.fillStyle = 'hsl(262, 32%, 42%)';
    assert.equal('#62498d', ctx.fillStyle);

    ctx.fillStyle = 'hsla(0, 0%, 0%, 1)';
    assert.equal('#000000', ctx.fillStyle);

    ctx.fillStyle = 'hsla(0, 100%, 100%, 1)';
    assert.equal('#ffffff', ctx.fillStyle);

    ctx.fillStyle = 'hsla(120, 25%, 75%, 0.5)';
    assert.equal('rgba(175, 207, 175, 0.50)', ctx.fillStyle);

    ctx.fillStyle = 'hsla(240, 75%, 25%, 0.75)';
    assert.equal('rgba(16, 16, 112, 0.75)', ctx.fillStyle);

    ctx.fillStyle = 'hsla(172.0, 33.00000e0%, 42%, 1)';
    assert.equal('#488e85', ctx.fillStyle);

    ctx.fillStyle = 'hsl(124.5, 76.1%, 47.6%)';
    assert.equal('#1dd62b', ctx.fillStyle);

    ctx.fillStyle = 'hsl(1.24e2, 760e-1%, 4.7e1%)';
    assert.equal('#1dd329', ctx.fillStyle);

    // case-insensitive (#235)
    ctx.fillStyle = "sILveR";
    assert.equal(ctx.fillStyle, "#c0c0c0");
  });

  it('Canvas#type', function () {
    var canvas = createCanvas(10, 10);
    assert.equal(canvas.type, 'image');
    var canvas = createCanvas(10, 10, 'pdf');
    assert.equal(canvas.type, 'pdf');
    var canvas = createCanvas(10, 10, 'svg');
    assert.equal(canvas.type, 'svg');
    var canvas = createCanvas(10, 10, 'hey');
    assert.equal(canvas.type, 'image');
  });

  it('Canvas#getContext("2d")', function () {
    var canvas = createCanvas(200, 300)
      , ctx = canvas.getContext('2d');
    assert.ok('object' == typeof ctx);
    assert.equal(canvas, ctx.canvas, 'context.canvas is not canvas');
    assert.equal(ctx, canvas.context, 'canvas.context is not context');

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
      [Math.pow(2, 32), 1, 1],
    ].forEach(params => {
      var width = params[0];
      var height = params[1];
      var errorLevel = params[2];

      var level = 3;

      try {
        var canvas = createCanvas(width, height);
        level--;

        var ctx = canvas.getContext('2d');
        level--;

        ctx.getImageData(0, 0, 1, 1);
        level--;
      } catch (err) {}

      if (errorLevel !== null)
        assert.strictEqual(level, errorLevel);
    });
  });

  it('Canvas#getContext("2d", {pixelFormat: string})', function () {
    var canvas, context;

    // default:
    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {pixelFormat: "RGBA32"});
    assert.equal(context.pixelFormat, "RGBA32");

    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {pixelFormat: "RGBA32"});
    assert.equal(context.pixelFormat, "RGBA32");

    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {pixelFormat: "RGB24"});
    assert.equal(context.pixelFormat, "RGB24");

    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {pixelFormat: "A8"});
    assert.equal(context.pixelFormat, "A8");

    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {pixelFormat: "A1"});
    assert.equal(context.pixelFormat, "A1");

    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {pixelFormat: "RGB16_565"});
    assert.equal(context.pixelFormat, "RGB16_565");

    // Not tested: RGB30
  });

  it('Canvas#getContext("2d", {alpha: boolean})', function () {
    var canvas, context;

    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {alpha: true});
    assert.equal(context.pixelFormat, "RGBA32");

    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {alpha: false});
    assert.equal(context.pixelFormat, "RGB24");

    // alpha takes priority:
    canvas = createCanvas(10, 10);
    context = canvas.getContext("2d", {pixelFormat: "RGBA32", alpha: false});
    assert.equal(context.pixelFormat, "RGB24");
  });

  it('Canvas#{width,height}=', function () {
    const canvas = createCanvas(100, 200);
    const context = canvas.getContext('2d');

    assert.equal(canvas.width, 100);
    assert.equal(canvas.height, 200);

    context.globalAlpha = .5;
    context.fillStyle = '#0f0';
    context.strokeStyle = '#0f0';
    context.font = '20px arial';
    context.fillRect(0, 0, 1, 1);

    canvas.width = 50;
    canvas.height = 70;
    assert.equal(canvas.width, 50);
    assert.equal(canvas.height, 70);

    context.font = '20px arial';
    assert.equal(context.font, '20px arial');
    canvas.width |= 0;

    assert.equal(context.lineWidth, 1); // #1095
    assert.equal(context.globalAlpha, 1); // #1292
    assert.equal(context.fillStyle, '#000000');
    assert.equal(context.strokeStyle, '#000000');
    assert.equal(context.font, '10px sans-serif');
    assert.strictEqual(context.getImageData(0, 0, 1, 1).data.join(','), '0,0,0,0');
  });

  it('Canvas#width= (resurfacing) doesn\'t crash when fillStyle is a pattern (#1357)', function (done) {
    const canvas = createCanvas(100, 200);
    const ctx = canvas.getContext('2d');

    loadImage(`${__dirname}/fixtures/checkers.png`).then(img => {
      const pattern = ctx.createPattern(img, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, 300, 300);
      canvas.width = 200; // cause canvas to resurface
      done();
    })
  });

  it('Canvas#stride', function() {
    var canvas = createCanvas(24, 10);
    assert.ok(canvas.stride >= 24, 'canvas.stride is too short');
    assert.ok(canvas.stride < 1024, 'canvas.stride seems too long');

    // TODO test stride on other formats
  });

  it('Canvas#getContext("invalid")', function () {
    assert.equal(null, createCanvas(200, 300).getContext('invalid'));
  });

  it('Context2d#patternQuality', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('good', ctx.patternQuality);
    ctx.patternQuality = 'best';
    assert.equal('best', ctx.patternQuality);
    ctx.patternQuality = 'invalid';
    assert.equal('best', ctx.patternQuality);
  });

  it('Context2d#imageSmoothingEnabled', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal(true, ctx.imageSmoothingEnabled);
    ctx.imageSmoothingEnabled = false;
    assert.equal('good', ctx.patternQuality);
    assert.equal(false, ctx.imageSmoothingEnabled);
    assert.equal('good', ctx.patternQuality);
  });

  it('Context2d#font=', function () {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    assert.equal(ctx.font, '10px sans-serif')
    ctx.font = '15px Arial, sans-serif'
    assert.equal(ctx.font, '15px Arial, sans-serif')

    ctx.font = 'Helvetica, sans' // invalid
    assert.equal(ctx.font, '15px Arial, sans-serif')
  });

  it('Context2d#lineWidth=', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    ctx.lineWidth = 10.0;
    assert.equal(10, ctx.lineWidth);
    ctx.lineWidth = Infinity;
    assert.equal(10, ctx.lineWidth);
    ctx.lineWidth = -Infinity;
    assert.equal(10, ctx.lineWidth);
    ctx.lineWidth = -5;
    assert.equal(10, ctx.lineWidth);
    ctx.lineWidth = 0;
    assert.equal(10, ctx.lineWidth);
  });

  it('Context2d#antiAlias=', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('default', ctx.antialias);
    ctx.antialias = 'none';
    assert.equal('none', ctx.antialias);
    ctx.antialias = 'gray';
    assert.equal('gray', ctx.antialias);
    ctx.antialias = 'subpixel';
    assert.equal('subpixel', ctx.antialias);
    ctx.antialias = 'invalid';
    assert.equal('subpixel', ctx.antialias);
    ctx.antialias = 1;
    assert.equal('subpixel', ctx.antialias);
  });

  it('Context2d#lineCap=', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('butt', ctx.lineCap);
    ctx.lineCap = 'round';
    assert.equal('round', ctx.lineCap);
  });

  it('Context2d#lineJoin=', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('miter', ctx.lineJoin);
    ctx.lineJoin = 'round';
    assert.equal('round', ctx.lineJoin);
  });

  it('Context2d#globalAlpha=', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal(1, ctx.globalAlpha);
    ctx.globalAlpha = 0.5
    assert.equal(0.5, ctx.globalAlpha);
  });

  it('Context2d#isPointInPath()', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    ctx.rect(5,5,100,100);
    ctx.rect(50,100,10,10);
    assert.ok(ctx.isPointInPath(10,10));
    assert.ok(ctx.isPointInPath(10,50));
    assert.ok(ctx.isPointInPath(100,100));
    assert.ok(ctx.isPointInPath(105,105));
    assert.ok(!ctx.isPointInPath(106,105));
    assert.ok(!ctx.isPointInPath(150,150));

    assert.ok(ctx.isPointInPath(50,110));
    assert.ok(ctx.isPointInPath(60,110));
    assert.ok(!ctx.isPointInPath(70,110));
    assert.ok(!ctx.isPointInPath(50,120));
  });

  it('Context2d#textAlign', function () {
    var canvas = createCanvas(200,200)
      , ctx = canvas.getContext('2d');

    assert.equal('start', ctx.textAlign);
    ctx.textAlign = 'center';
    assert.equal('center', ctx.textAlign);
    ctx.textAlign = 'right';
    assert.equal('right', ctx.textAlign);
    ctx.textAlign = 'end';
    assert.equal('end', ctx.textAlign);
    ctx.textAlign = 'fail';
    assert.equal('end', ctx.textAlign);
  });

  describe('#toBuffer', function () {
    it('Canvas#toBuffer()', function () {
      var buf = createCanvas(200,200).toBuffer();
      assert.equal('PNG', buf.slice(1,4).toString());
    });

    it('Canvas#toBuffer("image/png")', function () {
      var buf = createCanvas(200,200).toBuffer('image/png');
      assert.equal('PNG', buf.slice(1,4).toString());
    });

    it('Canvas#toBuffer("image/png", {resolution: 96})', function () {
      const buf = createCanvas(200, 200).toBuffer('image/png', {resolution: 96});
      // 3780 ppm ~= 96 ppi
      let foundpHYs = false;
      for (let i = 0; i < buf.length - 12; i++) {
        if (buf[i] === 0x70 &&
          buf[i + 1] === 0x48 &&
          buf[i + 2] === 0x59 &&
          buf[i + 3] === 0x73) { // pHYs
          foundpHYs = true;
          assert.equal(buf[i + 4], 0);
          assert.equal(buf[i + 5], 0);
          assert.equal(buf[i + 6], 0x0e);
          assert.equal(buf[i + 7], 0xc4); // x
          assert.equal(buf[i + 8], 0);
          assert.equal(buf[i + 9], 0);
          assert.equal(buf[i + 10], 0x0e);
          assert.equal(buf[i + 11], 0xc4); // y
        }
      }
      assert.ok(foundpHYs, "missing pHYs header");
    })

    it('Canvas#toBuffer("image/png", {compressionLevel: 5})', function () {
      var buf = createCanvas(200,200).toBuffer('image/png', {compressionLevel: 5});
      assert.equal('PNG', buf.slice(1,4).toString());
    });

    it('Canvas#toBuffer("image/jpeg")', function () {
      var buf = createCanvas(200,200).toBuffer('image/jpeg');
      assert.equal(buf[0], 0xff);
      assert.equal(buf[1], 0xd8);
      assert.equal(buf[buf.byteLength - 2], 0xff);
      assert.equal(buf[buf.byteLength - 1], 0xd9);
    });

    it('Canvas#toBuffer("image/jpeg", {quality: 0.95})', function () {
      var buf = createCanvas(200,200).toBuffer('image/jpeg', {quality: 0.95});
      assert.equal(buf[0], 0xff);
      assert.equal(buf[1], 0xd8);
      assert.equal(buf[buf.byteLength - 2], 0xff);
      assert.equal(buf[buf.byteLength - 1], 0xd9);
    });

    it('Canvas#toBuffer(callback)', function (done) {
      createCanvas(200, 200).toBuffer(function(err, buf){
        assert.ok(!err);
        assert.equal('PNG', buf.slice(1,4).toString());
        done();
      });
    });

    it('Canvas#toBuffer(callback, "image/jpeg")', function (done) {
      createCanvas(200,200).toBuffer(function (err, buf) {
        assert.ok(!err);
        assert.equal(buf[0], 0xff);
        assert.equal(buf[1], 0xd8);
        assert.equal(buf[buf.byteLength - 2], 0xff);
        assert.equal(buf[buf.byteLength - 1], 0xd9);
        done();
      }, 'image/jpeg');
    });

    it('Canvas#toBuffer(callback, "image/jpeg", {quality: 0.95})', function (done) {
      createCanvas(200,200).toBuffer(function (err, buf) {
        assert.ok(!err);
        assert.equal(buf[0], 0xff);
        assert.equal(buf[1], 0xd8);
        assert.equal(buf[buf.byteLength - 2], 0xff);
        assert.equal(buf[buf.byteLength - 1], 0xd9);
        done();
      }, 'image/jpeg', {quality: 0.95});
    });

    describe('#toBuffer("raw")', function() {
      var canvas = createCanvas(11, 10)
          , ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, 11, 10);

      ctx.fillStyle = 'rgba(200, 200, 200, 0.505)';
      ctx.fillRect(0, 0, 5, 5);

      ctx.fillStyle = 'red';
      ctx.fillRect(5, 0, 5, 5);

      ctx.fillStyle = '#00ff00';
      ctx.fillRect(0, 5, 5, 5);

      ctx.fillStyle = 'black';
      ctx.fillRect(5, 5, 4, 5);

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

      var buf = canvas.toBuffer('raw');
      var stride = canvas.stride;

      var endianness = os.endianness();

      function assertPixel(u32, x, y, message) {
        var expected = '0x' + u32.toString(16);

        // Buffer doesn't have readUInt32(): it only has readUInt32LE() and
        // readUInt32BE().
        var px = buf['readUInt32' + endianness](y * stride + x * 4);
        var actual = '0x' + px.toString(16);

        assert.equal(actual, expected, message);
      }

      it('should have the correct size', function() {
        assert.equal(buf.length, stride * 10);
      });

      it('does not premultiply alpha', function() {
        assertPixel(0x80646464, 0, 0, 'first semitransparent pixel');
        assertPixel(0x80646464, 4, 4, 'last semitransparent pixel');
      });

      it('draws red', function() {
        assertPixel(0xffff0000, 5, 0, 'first red pixel');
        assertPixel(0xffff0000, 9, 4, 'last red pixel');
      });

      it('draws green', function() {
        assertPixel(0xff00ff00, 0, 5, 'first green pixel');
        assertPixel(0xff00ff00, 4, 9, 'last green pixel');
      });

      it('draws black', function() {
        assertPixel(0xff000000, 5, 5, 'first black pixel');
        assertPixel(0xff000000, 8, 9, 'last black pixel');
      });

      it('leaves undrawn pixels black, transparent', function() {
        assertPixel(0x0, 9, 5, 'first undrawn pixel');
        assertPixel(0x0, 9, 9, 'last undrawn pixel');
      });

      it('is immutable', function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 10, 10);
        canvas.toBuffer('raw'); // (side-effect: flushes canvas)
        assertPixel(0xffff0000, 5, 0, 'first red pixel');
      });
    });
  });

  describe('#toDataURL()', function () {
    var canvas = createCanvas(200, 200)
      , ctx = canvas.getContext('2d');

    ctx.fillRect(0,0,100,100);
    ctx.fillStyle = 'red';
    ctx.fillRect(100,0,100,100);

    it('toDataURL() works and defaults to PNG', function () {
      assert.ok(canvas.toDataURL().startsWith('data:image/png;base64,'));
    });

    it('toDataURL(0.5) works and defaults to PNG', function () {
      assert.ok(canvas.toDataURL(0.5).startsWith('data:image/png;base64,'));
    });

    it('toDataURL(undefined) works and defaults to PNG', function () {
      assert.ok(canvas.toDataURL(undefined).startsWith('data:image/png;base64,'));
    });

    it('toDataURL("image/png") works', function () {
      assert.ok(canvas.toDataURL('image/png').startsWith('data:image/png;base64,'));
    });

    it('toDataURL("image/png", 0.5) works', function () {
      assert.ok(canvas.toDataURL('image/png').startsWith('data:image/png;base64,'));
    });

    it('toDataURL("iMaGe/PNg") works', function () {
      assert.ok(canvas.toDataURL('iMaGe/PNg').startsWith('data:image/png;base64,'));
    });

    it('toDataURL("image/jpeg") works', function () {
      assert.ok(canvas.toDataURL('image/jpeg').startsWith('data:image/jpeg;base64,'));
    });

    it('toDataURL(function (err, str) {...}) works and defaults to PNG', function (done) {
      createCanvas(200,200).toDataURL(function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL(function (err, str) {...}) is async even with no canvas data', function (done) {
      createCanvas().toDataURL(function(err, str){
        assert.ifError(err);
        assert.ok('data:,' === str);
        done();
      });
    });

    it('toDataURL(0.5, function (err, str) {...}) works and defaults to PNG', function (done) {
      createCanvas(200,200).toDataURL(0.5, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL(undefined, function (err, str) {...}) works and defaults to PNG', function (done) {
      createCanvas(200,200).toDataURL(undefined, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL("image/png", function (err, str) {...}) works', function (done) {
      createCanvas(200,200).toDataURL('image/png', function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL("image/png", 0.5, function (err, str) {...}) works', function (done) {
      createCanvas(200,200).toDataURL('image/png', 0.5, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL("image/png", {}) works', function () {
      assert.ok(canvas.toDataURL('image/png', {}).startsWith('data:image/png;base64,'));
    });

    it('toDataURL("image/jpeg", {}) works', function () {
      assert.ok(canvas.toDataURL('image/jpeg', {}).startsWith('data:image/jpeg;base64,'));
    });

    it('toDataURL("image/jpeg", function (err, str) {...}) works', function (done) {
      createCanvas(200,200).toDataURL('image/jpeg', function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });

    it('toDataURL("iMAge/JPEG", function (err, str) {...}) works', function (done) {
      createCanvas(200,200).toDataURL('iMAge/JPEG', function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });

    it('toDataURL("image/jpeg", undefined, function (err, str) {...}) works', function (done) {
      createCanvas(200,200).toDataURL('image/jpeg', undefined, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });

    it('toDataURL("image/jpeg", 0.5, function (err, str) {...}) works', function (done) {
      createCanvas(200,200).toDataURL('image/jpeg', 0.5, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });

    it('toDataURL("image/jpeg", opts, function (err, str) {...}) works', function (done) {
      createCanvas(200,200).toDataURL('image/jpeg', {quality: 100}, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });
  });

  describe('Context2d#createImageData(width, height)', function () {
    it("works", function () {
      var canvas = createCanvas(20, 20)
        , ctx = canvas.getContext('2d');

      var imageData = ctx.createImageData(2,6);
      assert.equal(2, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(2 * 6 * 4, imageData.data.length);

      assert.equal(0, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
      assert.equal(0, imageData.data[2]);
      assert.equal(0, imageData.data[3]);
    });

    it("works, A8 format", function () {
      var canvas = createCanvas(20, 20)
        , ctx = canvas.getContext('2d', {pixelFormat: "A8"});

      var imageData = ctx.createImageData(2,6);
      assert.equal(2, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(2 * 6 * 1, imageData.data.length);

      assert.equal(0, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
      assert.equal(0, imageData.data[2]);
      assert.equal(0, imageData.data[3]);
    });

    it("works, A1 format", function () {
      var canvas = createCanvas(20, 20)
        , ctx = canvas.getContext('2d', {pixelFormat: "A1"});

      var imageData = ctx.createImageData(2,6);
      assert.equal(2, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(Math.ceil(2 * 6 / 8), imageData.data.length);

      assert.equal(0, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
    });

    it("works, RGB24 format", function () {
      var canvas = createCanvas(20, 20)
        , ctx = canvas.getContext('2d', {pixelFormat: "RGB24"});

      var imageData = ctx.createImageData(2,6);
      assert.equal(2, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(2 * 6 * 4, imageData.data.length);

      assert.equal(0, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
      assert.equal(0, imageData.data[2]);
      assert.equal(0, imageData.data[3]);
    });

    it("works, RGB16_565 format", function () {
      var canvas = createCanvas(20, 20)
        , ctx = canvas.getContext('2d', {pixelFormat: "RGB16_565"});

      var imageData = ctx.createImageData(2,6);
      assert(imageData.data instanceof Uint16Array);
      assert.equal(2, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(2 * 6, imageData.data.length);

      assert.equal(0, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
    });
  });

  describe('Context2d#measureText()', function () {
    it('Context2d#measureText().width', function () {
      var canvas = createCanvas(20, 20)
        , ctx = canvas.getContext('2d');

      assert.ok(ctx.measureText('foo').width);
      assert.ok(ctx.measureText('foo').width != ctx.measureText('foobar').width);
      assert.ok(ctx.measureText('foo').width != ctx.measureText('  foo').width);
    });

    it('works', function () {
      var canvas = createCanvas(20, 20)
      var ctx = canvas.getContext('2d')
      ctx.font = "20px Arial"

      ctx.textBaseline = "alphabetic"
      var metrics = ctx.measureText("Alphabet")
      // Zero if the given baseline is the alphabetic baseline
      assert.equal(metrics.alphabeticBaseline, 0)
      // Positive = going up from the baseline
      assert.ok(metrics.actualBoundingBoxAscent > 0)
      // Positive = going down from the baseline
      assert.ok(metrics.actualBoundingBoxDescent > 0) // ~4-5

      ctx.textBaseline = "bottom"
      metrics = ctx.measureText("Alphabet")
      assert.strictEqual(ctx.textBaseline, "bottom")
      assert.ok(metrics.alphabeticBaseline > 0) // ~4-5
      assert.ok(metrics.actualBoundingBoxAscent > 0)
      // On the baseline or slightly above
      assert.ok(metrics.actualBoundingBoxDescent <= 0)
    });
  });

  it('Context2d#currentTransform', function () {
    var canvas = createCanvas(20, 20);
    var ctx = canvas.getContext('2d');

    ctx.scale(0.1, 0.3);
    var mat1 = ctx.currentTransform;
    assert.equal(mat1.a, 0.1);
    assert.equal(mat1.b, 0);
    assert.equal(mat1.c, 0);
    assert.equal(mat1.d, 0.3);
    assert.equal(mat1.e, 0);
    assert.equal(mat1.f, 0);

    ctx.resetTransform();
    var mat2 = ctx.currentTransform;
    assert.equal(mat2.a, 1);
    assert.equal(mat2.d, 1);

    ctx.currentTransform = mat1;
    var mat3 = ctx.currentTransform;
    assert.equal(mat3.a, 0.1);
    assert.equal(mat3.d, 0.3);
  });

  it('Context2d#createImageData(ImageData)', function () {
    var canvas = createCanvas(20, 20)
      , ctx = canvas.getContext('2d');

    var imageData = ctx.createImageData(ctx.createImageData(2, 6));
    assert.equal(2, imageData.width);
    assert.equal(6, imageData.height);
    assert.equal(2 * 6 * 4, imageData.data.length);
  });

  describe('Context2d#getImageData()', function () {
    function createTestCanvas(useAlpha, attributes) {
      var canvas = createCanvas(3, 6);
      var ctx = canvas.getContext('2d', attributes);

      ctx.fillStyle = useAlpha ? 'rgba(255,0,0,0.25)' : '#f00';
      ctx.fillRect(0,0,1,6);

      ctx.fillStyle = useAlpha ? 'rgba(0,255,0,0.5)' : '#0f0';
      ctx.fillRect(1,0,1,6);

      ctx.fillStyle = useAlpha ? 'rgba(0,0,255,0.75)' : '#00f';
      ctx.fillRect(2,0,1,6);

      return ctx;
    }

    it("works, full width, RGBA32", function () {
      var ctx = createTestCanvas();
      var imageData = ctx.getImageData(0,0,3,6);

      assert.equal(3, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(3 * 6 * 4, imageData.data.length);

      assert.equal(255, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
      assert.equal(0, imageData.data[2]);
      assert.equal(255, imageData.data[3]);

      assert.equal(0, imageData.data[4]);
      assert.equal(255, imageData.data[5]);
      assert.equal(0, imageData.data[6]);
      assert.equal(255, imageData.data[7]);

      assert.equal(0, imageData.data[8]);
      assert.equal(0, imageData.data[9]);
      assert.equal(255, imageData.data[10]);
      assert.equal(255, imageData.data[11]);
    });

    it("works, full width, RGB24", function () {
      var ctx = createTestCanvas(false, {pixelFormat: "RGB24"});
      var imageData = ctx.getImageData(0,0,3,6);
      assert.equal(3, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(3 * 6 * 4, imageData.data.length);

      assert.equal(255, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
      assert.equal(0, imageData.data[2]);
      assert.equal(255, imageData.data[3]);

      assert.equal(0, imageData.data[4]);
      assert.equal(255, imageData.data[5]);
      assert.equal(0, imageData.data[6]);
      assert.equal(255, imageData.data[7]);

      assert.equal(0, imageData.data[8]);
      assert.equal(0, imageData.data[9]);
      assert.equal(255, imageData.data[10]);
      assert.equal(255, imageData.data[11]);
    });

    it("works, full width, RGB16_565", function () {
      var ctx = createTestCanvas(false, {pixelFormat: "RGB16_565"});
      var imageData = ctx.getImageData(0,0,3,6);
      assert.equal(3, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(3 * 6 * 2, imageData.data.length);

      assert.equal((255 & 0b11111) << 11, imageData.data[0]);
      assert.equal((255 & 0b111111) << 5, imageData.data[1]);
      assert.equal((255 & 0b11111), imageData.data[2]);

      assert.equal((255 & 0b11111) << 11, imageData.data[3]);
      assert.equal((255 & 0b111111) << 5, imageData.data[4]);
      assert.equal((255 & 0b11111), imageData.data[5]);
    });

    it("works, full width, A8", function () {
      var ctx = createTestCanvas(true, {pixelFormat: "A8"});
      var imageData = ctx.getImageData(0,0,3,6);
      assert.equal(3, imageData.width);
      assert.equal(6, imageData.height);
      assert.equal(3 * 6, imageData.data.length);

      assert.equal(63, imageData.data[0]);
      assert.equal(127, imageData.data[1]);
      assert.equal(191, imageData.data[2]);

      assert.equal(63, imageData.data[3]);
      assert.equal(127, imageData.data[4]);
      assert.equal(191, imageData.data[5]);
    });

    it("works, full width, A1");

    it("works, full width, RGB30");

    it("works, slice, RGBA32", function () {
      var ctx = createTestCanvas();
      var imageData = ctx.getImageData(0,0,2,1);
      assert.equal(2, imageData.width);
      assert.equal(1, imageData.height);
      assert.equal(8, imageData.data.length);

      assert.equal(255, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
      assert.equal(0, imageData.data[2]);
      assert.equal(255, imageData.data[3]);

      assert.equal(0, imageData.data[4]);
      assert.equal(255, imageData.data[5]);
      assert.equal(0, imageData.data[6]);
      assert.equal(255, imageData.data[7]);
    });

    it("works, slice, RGB24", function () {
      var ctx = createTestCanvas(false, {pixelFormat: "RGB24"});
      var imageData = ctx.getImageData(0,0,2,1);
      assert.equal(2, imageData.width);
      assert.equal(1, imageData.height);
      assert.equal(8, imageData.data.length);

      assert.equal(255, imageData.data[0]);
      assert.equal(0, imageData.data[1]);
      assert.equal(0, imageData.data[2]);
      assert.equal(255, imageData.data[3]);

      assert.equal(0, imageData.data[4]);
      assert.equal(255, imageData.data[5]);
      assert.equal(0, imageData.data[6]);
      assert.equal(255, imageData.data[7]);
    });

    it("works, slice, RGB16_565", function () {
      var ctx = createTestCanvas(false, {pixelFormat: "RGB16_565"});
      var imageData = ctx.getImageData(0,0,2,1);
      assert.equal(2, imageData.width);
      assert.equal(1, imageData.height);
      assert.equal(2 * 1 * 2, imageData.data.length);

      assert.equal((255 & 0b11111) << 11, imageData.data[0]);
      assert.equal((255 & 0b111111) << 5, imageData.data[1]);
    });

    it("works, slice, A8", function () {
      var ctx = createTestCanvas(true, {pixelFormat: "A8"});
      var imageData = ctx.getImageData(0,0,2,1);
      assert.equal(2, imageData.width);
      assert.equal(1, imageData.height);
      assert.equal(2 * 1, imageData.data.length);

      assert.equal(63, imageData.data[0]);
      assert.equal(127, imageData.data[1]);
    });

    it("works, slice, A1");

    it("works, slice, RGB30");

    it("works, assignment", function () {
      var ctx = createTestCanvas();
      var data = ctx.getImageData(0,0,5,5).data;
      data[0] = 50;
      assert.equal(50, data[0]);
      data[0] = 280;
      assert.equal(255, data[0]);
      data[0] = -4444;
      assert.equal(0, data[0]);
    });

    it("throws if indexes are invalid", function () {
      var ctx = createTestCanvas();
      assert.throws(function () { ctx.getImageData(0, 0, 0, 0); }, /IndexSizeError/);
    });
  });

  it('Context2d#createPattern(Canvas)', function () {
    var pattern = createCanvas(2,2)
      , checkers = pattern.getContext('2d');

    // white
    checkers.fillStyle = '#fff';
    checkers.fillRect(0,0,2,2);

    // black
    checkers.fillStyle = '#000';
    checkers.fillRect(0,0,1,1);
    checkers.fillRect(1,1,1,1);

    var imageData = checkers.getImageData(0,0,2,2);
    assert.equal(2, imageData.width);
    assert.equal(2, imageData.height);
    assert.equal(16, imageData.data.length);

    // (0,0) black
    assert.equal(0, imageData.data[0]);
    assert.equal(0, imageData.data[1]);
    assert.equal(0, imageData.data[2]);
    assert.equal(255, imageData.data[3]);

    // (1,0) white
    assert.equal(255, imageData.data[4]);
    assert.equal(255, imageData.data[5]);
    assert.equal(255, imageData.data[6]);
    assert.equal(255, imageData.data[7]);

    // (0,1) white
    assert.equal(255, imageData.data[8]);
    assert.equal(255, imageData.data[9]);
    assert.equal(255, imageData.data[10]);
    assert.equal(255, imageData.data[11]);

    // (1,1) black
    assert.equal(0, imageData.data[12]);
    assert.equal(0, imageData.data[13]);
    assert.equal(0, imageData.data[14]);
    assert.equal(255, imageData.data[15]);

    var canvas = createCanvas(20, 20)
      , ctx = canvas.getContext('2d')
      , pattern = ctx.createPattern(pattern);

    ctx.fillStyle = pattern;
    ctx.fillRect(0,0,20,20);

    var imageData = ctx.getImageData(0,0,20,20);
    assert.equal(20, imageData.width);
    assert.equal(20, imageData.height);
    assert.equal(1600, imageData.data.length);

    var i=0, b = true;
    while(i<imageData.data.length){
      if( b ){
        assert.equal(  0, imageData.data[i++]);
        assert.equal(  0, imageData.data[i++]);
        assert.equal(  0, imageData.data[i++]);
        assert.equal(255, imageData.data[i++]);
      } else {
        assert.equal(255, imageData.data[i++]);
        assert.equal(255, imageData.data[i++]);
        assert.equal(255, imageData.data[i++]);
        assert.equal(255, imageData.data[i++]);
      }
      // alternate b, except when moving to a new row
      b = i % (imageData.width*4) == 0 ? b : !b;
    }
  });

  it('Context2d#createPattern(Image)', function () {
    return loadImage(`${__dirname}/fixtures/checkers.png`).then((img) => {
      var canvas = createCanvas(20, 20)
        , ctx = canvas.getContext('2d')
        , pattern = ctx.createPattern(img);

      ctx.fillStyle = pattern;
      ctx.fillRect(0,0,20,20);

      var imageData = ctx.getImageData(0,0,20,20);
      assert.equal(20, imageData.width);
      assert.equal(20, imageData.height);
      assert.equal(1600, imageData.data.length);

      var i=0, b = true;
      while (i<imageData.data.length){
        if (b) {
          assert.equal(  0, imageData.data[i++]);
          assert.equal(  0, imageData.data[i++]);
          assert.equal(  0, imageData.data[i++]);
          assert.equal(255, imageData.data[i++]);
        } else {
          assert.equal(255, imageData.data[i++]);
          assert.equal(255, imageData.data[i++]);
          assert.equal(255, imageData.data[i++]);
          assert.equal(255, imageData.data[i++]);
        }
        // alternate b, except when moving to a new row
        b = i % (imageData.width*4) == 0 ? b : !b;
      }
    })
  });

  it('Context2d#createLinearGradient()', function () {
    var canvas = createCanvas(20, 1)
      , ctx = canvas.getContext('2d')
      , gradient = ctx.createLinearGradient(1,1,19,1);

    gradient.addColorStop(0,'#fff');
    gradient.addColorStop(1,'#000');

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,20,1);

    var imageData = ctx.getImageData(0,0,20,1);
    assert.equal(20, imageData.width);
    assert.equal(1, imageData.height);
    assert.equal(80, imageData.data.length);

    // (0,0) white
    assert.equal(255, imageData.data[0]);
    assert.equal(255, imageData.data[1]);
    assert.equal(255, imageData.data[2]);
    assert.equal(255, imageData.data[3]);

    // (20,0) black
    var i = imageData.data.length-4;
    assert.equal(0, imageData.data[i+0]);
    assert.equal(0, imageData.data[i+1]);
    assert.equal(0, imageData.data[i+2]);
    assert.equal(255, imageData.data[i+3]);
  });

  describe('Context2d#putImageData()', function () {
    it('throws for invalid arguments', function () {
      var canvas = createCanvas(2, 1);
      var ctx = canvas.getContext('2d');
      assert.throws(function () { ctx.putImageData({}, 0, 0); }, TypeError);
      assert.throws(function () { ctx.putImageData(undefined, 0, 0); }, TypeError);
    });

    it('works for negative source values', function () {
      var canvas = createCanvas(2, 2);
      var ctx = canvas.getContext('2d');
      var srcImageData = createImageData(new Uint8ClampedArray([
        1,2,3,255, 5,6,7,255,
        0,1,2,255, 4,5,6,255
      ]), 2);

      ctx.putImageData(srcImageData, -1, -1);

      var resImageData = ctx.getImageData(0, 0, 2, 2);
      assert.deepEqual(resImageData.data, new Uint8ClampedArray([
        4,5,6,255, 0,0,0,0,
        0,0,0,0, 0,0,0,0
      ]));
    });

    it('works, RGBA32', function () {
      var canvas = createCanvas(2, 1);
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f00';
      ctx.fillRect(0, 0, 1, 1);

      // Copy left pixel to the right pixel
      ctx.putImageData(ctx.getImageData(0, 0, 1, 1), 1, 0);

      var pixel = ctx.getImageData(1, 0, 1, 1);

      assert.equal(pixel.data[0], 255);
      assert.equal(pixel.data[1], 0);
      assert.equal(pixel.data[2], 0);
      assert.equal(pixel.data[3], 255);
    });

    it('works, RGB24/alpha:false', function () {
      var canvas = createCanvas(2, 1);
      var ctx = canvas.getContext('2d', {pixelFormat: 'RGB24'});
      ctx.fillStyle = '#f00';
      ctx.fillRect(0, 0, 1, 1);

      // Copy left pixel to the right pixel
      ctx.putImageData(ctx.getImageData(0, 0, 1, 1), 1, 0);

      var pixel = ctx.getImageData(1, 0, 1, 1);

      assert.equal(pixel.data[0], 255);
      assert.equal(pixel.data[1], 0);
      assert.equal(pixel.data[2], 0);
      assert.equal(pixel.data[3], 255);
    });

    it('works, A8', function () {
      var canvas = createCanvas(2, 1);
      var ctx = canvas.getContext('2d', {pixelFormat: 'A8'});

      var imgData = ctx.getImageData(0, 0, 2, 1);
      imgData.data[0] = 4;
      imgData.data[1] = 21;
      ctx.putImageData(imgData, 0, 0);

      var pixel = ctx.getImageData(0, 0, 2, 1);

      assert.equal(pixel.data[0], 4);
      assert.equal(pixel.data[1], 21);
    });

    it('works, RGB16_565', function () {
      var canvas = createCanvas(2, 1);
      var ctx = canvas.getContext('2d', {pixelFormat: 'RGB16_565'});

      var imgData = ctx.getImageData(0, 0, 2, 1);
      imgData.data[0] = 65535; // 2**16 - 1
      imgData.data[1] = 65500;
      ctx.putImageData(imgData, 0, 0);

      var pixel = ctx.getImageData(0, 0, 2, 1);

      assert.equal(pixel.data[0], 65535);
      assert.equal(pixel.data[1], 65500);
    });
  });

  it('Canvas#createPNGStream()', function (done) {
    var canvas = createCanvas(20, 20);
    var stream = canvas.createPNGStream();
    assert(stream instanceof Readable);
    var firstChunk = true;
    stream.on('data', function(chunk){
      if (firstChunk) {
        firstChunk = false;
        assert.equal('PNG', chunk.slice(1,4).toString());
      }
    });
    stream.on('end', function(){
      done();
    });
    stream.on('error', function(err) {
      done(err);
    });
  });

  it('Canvas#createPDFStream()', function (done) {
    var canvas = createCanvas(20, 20, 'pdf');
    var stream = canvas.createPDFStream();
    assert(stream instanceof Readable);
    var firstChunk = true;
    stream.on('data', function (chunk) {
      if (firstChunk) {
        firstChunk = false;
        assert.equal(chunk.slice(1, 4).toString(), 'PDF');
      }
    });
    stream.on('end', function () {
      done();
    });
    stream.on('error', function (err) {
      done(err);
    });
  });

  it('Canvas#createJPEGStream()', function (done) {
    var canvas = createCanvas(640, 480);
    var stream = canvas.createJPEGStream();
    assert(stream instanceof Readable);
    var firstChunk = true;
    var bytes = 0;
    stream.on('data', function(chunk){
      if (firstChunk) {
        firstChunk = false;
        assert.equal(0xFF, chunk[0]);
        assert.equal(0xD8, chunk[1]);
        assert.equal(0xFF, chunk[2]);
      }
      bytes += chunk.length;
    });
    stream.on('end', function(){
      assert.equal(bytes, 5427);
      done();
    });
    stream.on('error', function(err) {
      done(err);
    });
  });

  // based on https://en.wikipedia.org/wiki/JPEG_File_Interchange_Format
  // end of image marker (FF D9) must exist to maintain JPEG standards
  it('EOI at end of Canvas#createJPEGStream()', function (done) {
    var canvas = createCanvas(640, 480);
    var stream = canvas.createJPEGStream();
    var chunks = []
    stream.on('data', function(chunk){
      chunks.push(chunk)
    });
    stream.on('end', function(){
      var lastTwoBytes = chunks.pop().slice(-2)
      assert.equal(0xFF, lastTwoBytes[0]);
      assert.equal(0xD9, lastTwoBytes[1]);
      done();
    });
    stream.on('error', function(err) {
      done(err);
    });
  });

  it('Context2d#fill()', function() {
    var canvas = createCanvas(2, 2);
    var ctx = canvas.getContext('2d');

    // fill whole canvas with white
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 2, 2);

    var imageData, n;

    // black
    ctx.fillStyle = '#000';
    ctx.rect(0, 0, 2, 1);
    ctx.rect(1, 0, 1, 2);

    ctx.fill('evenodd');
    // b | w
    // -----
    // w | b
    imageData = ctx.getImageData(0, 0, 2, 2);
    // (0, 0) black
    n = 0;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);
    // (0, 1) white
    n = 1;
    assert.equal(imageData.data[n*4+0], 255);
    assert.equal(imageData.data[n*4+1], 255);
    assert.equal(imageData.data[n*4+2], 255);
    assert.equal(imageData.data[n*4+3], 255);
    // (1, 0) white
    n = 2;
    assert.equal(imageData.data[n*4+0], 255);
    assert.equal(imageData.data[n*4+1], 255);
    assert.equal(imageData.data[n*4+2], 255);
    assert.equal(imageData.data[n*4+3], 255);
    // (1, 1) black
    n = 3;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);

    // should not retain previous value 'evenodd'
    ctx.fill();
    // b | b
    // -----
    // w | b
    imageData = ctx.getImageData(0, 0, 2, 2);
    // (0, 0) black
    n = 0;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);
    // (0, 1) black
    n = 1;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);
    // (1, 0) white
    n = 2;
    assert.equal(imageData.data[n*4+0], 255);
    assert.equal(imageData.data[n*4+1], 255);
    assert.equal(imageData.data[n*4+2], 255);
    assert.equal(imageData.data[n*4+3], 255);
    // (1, 1) black
    n = 3;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);
  });

  it('Context2d#clip()', function () {
    var canvas = createCanvas(2, 2);
    var ctx = canvas.getContext('2d');

    // fill whole canvas with white
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 2, 2);

    var imageData, n;

    // black
    ctx.fillStyle = '#000';
    ctx.rect(0, 0, 2, 1);
    ctx.rect(1, 0, 1, 2);

    ctx.clip('evenodd');
    ctx.fillRect(0, 0, 2, 2);
    // b | w
    // -----
    // w | b
    imageData = ctx.getImageData(0, 0, 2, 2);
    // (0, 0) black
    n = 0;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);
    // (0, 1) white
    n = 1;
    assert.equal(imageData.data[n*4+0], 255);
    assert.equal(imageData.data[n*4+1], 255);
    assert.equal(imageData.data[n*4+2], 255);
    assert.equal(imageData.data[n*4+3], 255);
    // (1, 0) white
    n = 2;
    assert.equal(imageData.data[n*4+0], 255);
    assert.equal(imageData.data[n*4+1], 255);
    assert.equal(imageData.data[n*4+2], 255);
    assert.equal(imageData.data[n*4+3], 255);
    // (1, 1) black
    n = 3;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);

    ctx.clip();
    ctx.fillRect(0, 0, 2, 2);
    // b | b
    // -----
    // w | b
    imageData = ctx.getImageData(0, 0, 2, 2);
    // (0, 0) black
    n = 0;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);
    // (0, 1) white
    n = 1;
    assert.equal(imageData.data[n*4+0], 255);
    assert.equal(imageData.data[n*4+1], 255);
    assert.equal(imageData.data[n*4+2], 255);
    assert.equal(imageData.data[n*4+3], 255);
    // (1, 0) white
    n = 2;
    assert.equal(imageData.data[n*4+0], 255);
    assert.equal(imageData.data[n*4+1], 255);
    assert.equal(imageData.data[n*4+2], 255);
    assert.equal(imageData.data[n*4+3], 255);
    // (1, 1) black
    n = 3;
    assert.equal(imageData.data[n*4+0], 0);
    assert.equal(imageData.data[n*4+1], 0);
    assert.equal(imageData.data[n*4+2], 0);
    assert.equal(imageData.data[n*4+3], 255);
  });

  it('Context2d#IsPointInPath()', function () {
    var canvas = createCanvas(4, 4);
    var ctx = canvas.getContext('2d');

    ctx.rect(0, 0, 4, 2);
    ctx.rect(2, 0, 2, 4);
    ctx.stroke();

    assert.ok(ctx.isPointInPath(1, 1, 'evenodd'));
    assert.ok(!ctx.isPointInPath(3, 1, 'evenodd'));
    assert.ok(ctx.isPointInPath(3, 1));
    assert.ok(!ctx.isPointInPath(1, 3, 'evenodd'));
    assert.ok(ctx.isPointInPath(3, 3, 'evenodd'));
  });

  it('Context2d#rotate(angle)', function () {
    var canvas = createCanvas(4, 4);
    var ctx = canvas.getContext('2d');

    // Number
    ctx.resetTransform();
    testAngle(1.23, 1.23);

    // String
    ctx.resetTransform();
    testAngle('-4.56e-1', -0.456);

    // Boolean
    ctx.resetTransform();
    testAngle(true, 1);

    // Array
    ctx.resetTransform();
    testAngle([7.8], 7.8);

    // Object
    var obj = Object.create(null);
    if (+process.version.match(/\d+/) >= 6)
      obj[Symbol.toPrimitive] = function () { return 0.89; };
    else
      obj.valueOf = function () { return 0.89; };
    ctx.resetTransform();
    testAngle(obj, 0.89);

    // NaN
    ctx.resetTransform();
    ctx.rotate(0.91);
    testAngle(NaN, 0.91);

    // Infinite value
    ctx.resetTransform();
    ctx.rotate(0.94);
    testAngle(-Infinity, 0.94);

    function testAngle(angle, expected){
      ctx.rotate(angle);

      var mat = ctx.currentTransform;
      var sin = Math.sin(expected);
      var cos = Math.cos(expected);

      assert.ok(Math.abs(mat.m11 - cos) < Number.EPSILON);
      assert.ok(Math.abs(mat.m12 - sin) < Number.EPSILON);
      assert.ok(Math.abs(mat.m21 + sin) < Number.EPSILON);
      assert.ok(Math.abs(mat.m22 - cos) < Number.EPSILON);
    }
  });

  it('Context2d#drawImage()', function () {
    var canvas = createCanvas(500, 500);
    var ctx = canvas.getContext('2d');

    // Drawing canvas to itself
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 500, 500);
    ctx.fillStyle = 'black';
    ctx.fillRect(5, 5, 10, 10);
    ctx.drawImage(canvas, 20, 20);

    var imgd = ctx.getImageData(0, 0, 500, 500);
    var data = imgd.data;
    var count = 0;

    for(var i = 0; i < 500 * 500 * 4; i += 4){
      if(data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0)
        count++;
    }

    assert.strictEqual(count, 10 * 10 * 2);

    // Drawing zero-width image
    ctx.drawImage(canvas, 0, 0, 0, 0, 0, 0, 0, 0);
    ctx.drawImage(canvas, 0, 0, 0, 0, 1, 1, 1, 1);
    ctx.drawImage(canvas, 1, 1, 1, 1, 0, 0, 0, 0);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 500, 500);

    imgd = ctx.getImageData(0, 0, 500, 500);
    data = imgd.data;
    count = 0;

    for(i = 0; i < 500 * 500 * 4; i += 4){
      if(data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255)
        count++;
    }

    assert.strictEqual(count, 500 * 500);
  });

  it('Context2d#SetFillColor()', function () {
    var canvas = createCanvas(2, 2);
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = ['#808080'];
    ctx.fillRect(0, 0, 2, 2);
    var data = ctx.getImageData(0, 0, 2, 2).data;

    data.forEach(function (byte, index) {
      if (index + 1 & 3)
        assert.strictEqual(byte, 128);
      else
        assert.strictEqual(byte, 255);
    });

    assert.throws(function () {
      ctx.fillStyle = Object.create(null);
    });
  });

});
