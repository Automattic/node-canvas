/**
 * Module dependencies.
 */

var Canvas = require('../')
  , assert = require('assert')
  , parseFont = Canvas.Context2d.parseFont
  , fs = require('fs')
  , os = require('os');

console.log();
console.log('   canvas: %s', Canvas.version);
console.log('   cairo: %s', Canvas.cairoVersion);

describe('Canvas', function () {
  it('should require new', function () {
    assert.throws(function () { Canvas(); }, TypeError);
  });

  it('.version', function () {
    assert.ok(/^\d+\.\d+\.\d+$/.test(Canvas.version));
  });

  it('.cairoVersion', function () {
    assert.ok(/^\d+\.\d+\.\d+$/.test(Canvas.cairoVersion));
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
      , { size: 20, unit: '%', family: 'Arial' }
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
    ];

    for (var i = 0, len = tests.length; i < len; ++i) {
      var str = tests[i++]
        , obj = tests[i]
        , actual = parseFont(str);

      if (!obj.style) obj.style = 'normal';
      if (!obj.weight) obj.weight = 'normal';

      assert.deepEqual(obj, actual);
    }
  });

  it('color serialization', function () {
    var canvas = new Canvas(200, 200)
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
    var canvas = new Canvas(200, 200)
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
  });

  it('Canvas#type', function () {
    var canvas = new Canvas(10, 10);
    assert('image' == canvas.type);
    var canvas = new Canvas(10, 10, 'pdf');
    assert('pdf' == canvas.type);
    var canvas = new Canvas(10, 10, 'svg');
    assert('svg' == canvas.type);
    var canvas = new Canvas(10, 10, 'hey');
    assert('image' == canvas.type);
  });

  it('Canvas#getContext("2d")', function () {
    var canvas = new Canvas(200, 300)
      , ctx = canvas.getContext('2d');
    assert.ok('object' == typeof ctx);
    assert.equal(canvas, ctx.canvas, 'context.canvas is not canvas');
    assert.equal(ctx, canvas.context, 'canvas.context is not context');
  });

  it('Canvas#{width,height}=', function () {
    var canvas = new Canvas(100, 200);
    assert.equal(100, canvas.width);
    assert.equal(200, canvas.height);

    canvas = new Canvas;
    assert.equal(0, canvas.width);
    assert.equal(0, canvas.height);

    canvas.width = 50;
    canvas.height = 50;
    assert.equal(50, canvas.width);
    assert.equal(50, canvas.height);
  });

  it('Canvas#stride', function() {
    var canvas = new Canvas(24, 10);
    assert.ok(canvas.stride >= 24, 'canvas.stride is too short');
    assert.ok(canvas.stride < 1024, 'canvas.stride seems too long');
  });

  it('Canvas#getContext("invalid")', function () {
    assert.equal(null, new Canvas(200, 300).getContext('invalid'));
  });

  it('Context2d#patternQuality', function () {
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('good', ctx.patternQuality);
    ctx.patternQuality = 'best';
    assert.equal('best', ctx.patternQuality);
    ctx.patternQuality = 'invalid';
    assert.equal('best', ctx.patternQuality);
  });

  it('Context2d#font=', function () {
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('10px sans-serif', ctx.font);
    ctx.font = '15px Arial, sans-serif';
    assert.equal('15px Arial, sans-serif', ctx.font);
  });

  it('Context2d#lineWidth=', function () {
    var canvas = new Canvas(200, 200)
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
    var canvas = new Canvas(200, 200)
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
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('butt', ctx.lineCap);
    ctx.lineCap = 'round';
    assert.equal('round', ctx.lineCap);
  });

  it('Context2d#lineJoin=', function () {
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('miter', ctx.lineJoin);
    ctx.lineJoin = 'round';
    assert.equal('round', ctx.lineJoin);
  });

  it('Context2d#globalAlpha=', function () {
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal(1, ctx.globalAlpha);
    ctx.globalAlpha = 0.5
    assert.equal(0.5, ctx.globalAlpha);
  });

  it('Context2d#isPointInPath()', function () {
    var canvas = new Canvas(200, 200)
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
    var canvas = new Canvas(200,200)
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

  it('Canvas#toBuffer()', function () {
    var buf = new Canvas(200,200).toBuffer();
    assert.equal('PNG', buf.slice(1,4).toString());
  });

  it('Canvas#toBuffer() async', function (done) {
    new Canvas(200, 200).toBuffer(function(err, buf){
      assert.ok(!err);
      assert.equal('PNG', buf.slice(1,4).toString());
      done();
    });
  });

  describe('#toBuffer("raw")', function() {
    var canvas = new Canvas(10, 10)
        , ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 10, 10);

    ctx.fillStyle = 'rgba(200, 200, 200, 0.505)';
    ctx.fillRect(0, 0, 5, 5);

    ctx.fillStyle = 'red';
    ctx.fillRect(5, 0, 5, 5);

    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 5, 5, 5);

    ctx.fillStyle = 'black';
    ctx.fillRect(5, 5, 4, 5);

    /** Output:
     *    *****RRRRR
     *    *****RRRRR
     *    *****RRRRR
     *    *****RRRRR
     *    *****RRRRR
     *    GGGGGBBBB-
     *    GGGGGBBBB-
     *    GGGGGBBBB-
     *    GGGGGBBBB-
     *    GGGGGBBBB-
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

  describe('#toDataURL()', function () {
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    ctx.fillRect(0,0,100,100);
    ctx.fillStyle = 'red';
    ctx.fillRect(100,0,100,100);

    it('toDataURL() works and defaults to PNG', function () {
      assert.ok(0 == canvas.toDataURL().indexOf('data:image/png;base64,'));
    });

    it('toDataURL(0.5) works and defaults to PNG', function () {
      assert.ok(0 == canvas.toDataURL(0.5).indexOf('data:image/png;base64,'));
    });

    it('toDataURL(undefined) works and defaults to PNG', function () {
      assert.ok(0 == canvas.toDataURL(undefined).indexOf('data:image/png;base64,'));
    });

    it('toDataURL("image/png") works', function () {
      assert.ok(0 == canvas.toDataURL('image/png').indexOf('data:image/png;base64,'));
    });

    it('toDataURL("image/png", 0.5) works', function () {
      assert.ok(0 == canvas.toDataURL('image/png').indexOf('data:image/png;base64,'));
    });

    it('toDataURL("iMaGe/PNg") works', function () {
      assert.ok(0 == canvas.toDataURL('iMaGe/PNg').indexOf('data:image/png;base64,'));
    });

    it('toDataURL("image/jpeg") throws', function () {
      assert.throws(
        function () {
          canvas.toDataURL('image/jpeg');
        },
        function (err) {
          return err.message === 'Missing required callback function for format "image/jpeg"';
        }
      );
    });

    it('toDataURL(function (err, str) {...}) works and defaults to PNG', function (done) {
      new Canvas(200,200).toDataURL(function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL(0.5, function (err, str) {...}) works and defaults to PNG', function (done) {
      new Canvas(200,200).toDataURL(0.5, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL(undefined, function (err, str) {...}) works and defaults to PNG', function (done) {
      new Canvas(200,200).toDataURL(undefined, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL("image/png", function (err, str) {...}) works', function (done) {
      new Canvas(200,200).toDataURL('image/png', function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL("image/png", 0.5, function (err, str) {...}) works', function (done) {
      new Canvas(200,200).toDataURL('image/png', 0.5, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/png;base64,'));
        done();
      });
    });

    it('toDataURL("image/png", {}) works', function () {
      assert.ok(0 == canvas.toDataURL('image/png', {}).indexOf('data:image/png;base64,'));
    });

    it('toDataURL("image/jpeg", {}) throws', function () {
      assert.throws(
        function () {
          canvas.toDataURL('image/jpeg', {});
        },
        function (err) {
          return err.message === 'Missing required callback function for format "image/jpeg"';
        }
      );
    });

    it('toDataURL("image/jpeg", function (err, str) {...}) works', function (done) {
      new Canvas(200,200).toDataURL('image/jpeg', function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });

    it('toDataURL("iMAge/JPEG", function (err, str) {...}) works', function (done) {
      new Canvas(200,200).toDataURL('iMAge/JPEG', function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });

    it('toDataURL("image/jpeg", undefined, function (err, str) {...}) works', function (done) {
      new Canvas(200,200).toDataURL('image/jpeg', undefined, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });

    it('toDataURL("image/jpeg", 0.5, function (err, str) {...}) works', function (done) {
      new Canvas(200,200).toDataURL('image/jpeg', 0.5, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });

    it('toDataURL("image/jpeg", opts, function (err, str) {...}) works', function (done) {
      new Canvas(200,200).toDataURL('image/jpeg', {quality: 100}, function(err, str){
        assert.ifError(err);
        assert.ok(0 === str.indexOf('data:image/jpeg;base64,'));
        done();
      });
    });
  });

  it('Context2d#createImageData(width, height)', function () {
    var canvas = new Canvas(20, 20)
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

  it('Context2d#measureText().width', function () {
    var canvas = new Canvas(20, 20)
      , ctx = canvas.getContext('2d');

    assert.ok(ctx.measureText('foo').width);
    assert.ok(ctx.measureText('foo').width != ctx.measureText('foobar').width);
    assert.ok(ctx.measureText('foo').width != ctx.measureText('  foo').width);
  });

  it('Context2d#createImageData(ImageData)', function () {
    var canvas = new Canvas(20, 20)
      , ctx = canvas.getContext('2d');

    var imageData = ctx.createImageData(ctx.createImageData(2, 6));
    assert.equal(2, imageData.width);
    assert.equal(6, imageData.height);
    assert.equal(2 * 6 * 4, imageData.data.length);
  });

  it('Context2d#getImageData()', function () {
    var canvas = new Canvas(3, 6)
      , ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f00';
    ctx.fillRect(0,0,1,6);

    ctx.fillStyle = '#0f0';
    ctx.fillRect(1,0,1,6);

    ctx.fillStyle = '#00f';
    ctx.fillRect(2,0,1,6);

    // Full width
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

    // Slice
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

    // Assignment
    var data = ctx.getImageData(0,0,5,5).data;
    data[0] = 50;
    assert.equal(50, data[0]);
    data[0] = 280;
    assert.equal(255, data[0]);
    data[0] = -4444;
    assert.equal(0, data[0]);
  });

  it('Context2d#createPattern(Canvas)', function () {
    var pattern = new Canvas(2,2)
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

    var canvas = new Canvas(20, 20)
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
    var img = new Canvas.Image();
    img.src = __dirname + '/fixtures/checkers.png';

    var canvas = new Canvas(20, 20)
      , ctx = canvas.getContext('2d')
      , pattern = ctx.createPattern(img);

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

  it('Context2d#createLinearGradient()', function () {
    var canvas = new Canvas(20, 1)
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

  it('Context2d#getImageData()', function () {
    var canvas = new Canvas(1, 1)
      , ctx = canvas.getContext('2d');

    assert.throws(function () { ctx.getImageData(0, 0, 0, 0); }, /IndexSizeError/);

    ctx.fillStyle = '#f00';
    ctx.fillRect(0, 0, 1, 1);

    var pixel = ctx.getImageData(0, 0, 1, 1);

    assert.equal(pixel.data[0], 255);
    assert.equal(pixel.data[1], 0);
    assert.equal(pixel.data[2], 0);
    assert.equal(pixel.data[3], 255);
  });

  it('Context2d#putImageData()', function () {
    var canvas = new Canvas(2, 1)
      , ctx = canvas.getContext('2d');

    assert.throws(function () { ctx.putImageData({}, 0, 0); }, TypeError);
    assert.throws(function () { ctx.putImageData(undefined, 0, 0); }, TypeError);

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

  it('Canvas#createSyncPNGStream()', function (done) {
    var canvas = new Canvas(20, 20);
    var stream = canvas.createSyncPNGStream();
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

  it('Canvas#createSyncPDFStream()', function (done) {
    var canvas = new Canvas(20, 20, 'pdf');
    var stream = canvas.createSyncPDFStream();
    var firstChunk = true;
    stream.on('data', function (chunk) {
      if (firstChunk) {
        firstChunk = false;
        assert.equal('PDF', chunk.slice(1, 4).toString());
      }
    });
    stream.on('end', function () {
      done();
    });
    stream.on('error', function (err) {
      done(err);
    });
  });

  it('Canvas#jpegStream()', function (done) {
    var canvas = new Canvas(640, 480);
    var stream = canvas.jpegStream();
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

  it('Canvas#jpegStream() should clamp buffer size (#674)', function (done) {
    var c = new Canvas(10, 10);
    var SIZE = 10 * 1024 * 1024;
    var s = c.jpegStream({bufsize: SIZE});
    s.on('data', function (chunk) {
      assert(chunk.length < SIZE);
    });
    s.on('end', done);
  });

  it('Context2d#fill()', function() {
    var canvas = new Canvas(2, 2);
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
    var canvas = new Canvas(2, 2);
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
    var canvas = new Canvas(4, 4);
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

});
