
/**
 * Module dependencies.
 */

var Canvas = require('../')
  , Image = Canvas.Image
  , assert = require('assert');

var png_checkers = __dirname + '/fixtures/checkers.png';
var png_clock = __dirname + '/fixtures/clock.png';

describe('Image', function () {
  it('should require new', function () {
    assert.throws(function () { Image(); }, TypeError);
  });

  it('Image', function () {
    assert.ok(Image instanceof Function);
  });

  it('Image#onload', function () {
    var img = new Image
      , onloadCalled = 0;

    assert.strictEqual(null, img.onload);
    assert.strictEqual(false, img.complete);

    img.onload = function () {
      onloadCalled += 1;
      assert.strictEqual(img.src, png_clock);
    };

    img.src = png_clock;
    assert.strictEqual(1, onloadCalled);
    assert.strictEqual(img.src, png_clock);

    assert.strictEqual(true, img.complete);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);
  });

  it('test Image#onload multiple times', function() {
    var img = new Image
      , onloadCalled = 0;

    img.onload = function() {
      onloadCalled += 1;
    };

    img.src = png_checkers;
    assert.equal(img.src, png_checkers);
    assert.strictEqual(true, img.complete);
    assert.strictEqual(2, img.width);
    assert.strictEqual(2, img.height);

    img.src = png_clock;
    assert.equal(img.src, png_clock);
    assert.strictEqual(true, img.complete);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);

    assert.equal(onloadCalled, 2);

    onloadCalled = 0;
    img.onload = function() {
      onloadCalled += 1;
    };
    img.src = png_clock;
    assert.equal(onloadCalled, 1);
  });

  it('Image#onerror', function () {
    var img = new Image
      , error
      , onerrorCalled = 0;

    assert.strictEqual(null, img.onerror);
    assert.strictEqual(false, img.complete);

    img.onload = function () {
      assert.fail('called onload');
    };

    img.onerror = function (err) {
      onerrorCalled += 1;
      error = err;
    };

    try {
      img.src = png_clock + 's';
    } catch (err) {
      assert.fail('error did not invoke onerror(): ' + err);
    }

    assert.strictEqual(1, onerrorCalled);
    assert.strictEqual(img.src, png_clock + 's');
    assert.strictEqual(false, img.complete);

    assert.ok(error instanceof Error, 'did not invoke onerror() with error');
  });

  it('test Image#onerror multiple calls', function() {
    var img = new Image
      , onerrorCalled = 0;


    img.onload = function() {
      assert.fail('called onload');
    };

    img.onerror = function() {
      onerrorCalled += 1;
    };

    img.src = png_clock + 's1';
    assert.equal(img.src, png_clock + 's1');

    img.src = png_clock + 's2';
    assert.equal(img.src, png_clock + 's2');

    assert.equal(onerrorCalled, 2);

    onerrorCalled = 0;
    img.onerror = function() {
      onerrorCalled += 1;
    };
    img.src = png_clock + 's3';
    assert.equal(img.src, png_clock + 's3');
    assert.equal(onerrorCalled, 1);
  });

  it('Image#{width,height}', function () {
    var img = new Image
      , onloadCalled = 0;

    assert.strictEqual(0, img.width);
    assert.strictEqual(0, img.height);

    img.onload = function () {
      onloadCalled += 1;
      assert.strictEqual(320, img.width);
      assert.strictEqual(320, img.height);
    };

    img.src = png_clock;
    assert.strictEqual(1, onloadCalled);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);
  });

  it('Image#src set empty buffer', function () {
    var image = new Canvas.Image();
    image.src = new Buffer(0);
    image.src = new Buffer('');
  });

  it('should unbind Image#onload', function() {
    var img = new Image
      , onloadCalled = 0;

    img.onload = function() {
      onloadCalled += 1;
    };

    img.src = png_checkers;
    assert.equal(img.src, png_checkers);
    assert.strictEqual(true, img.complete);
    assert.strictEqual(2, img.width);
    assert.strictEqual(2, img.height);

    assert.equal(onloadCalled, 1);

    onloadCalled = 0;
    img.onload = null;
    img.src = png_clock;
    assert.equal(img.src, png_clock);
    assert.strictEqual(true, img.complete);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);

    assert.equal(onloadCalled, 0);
  });

  it('should unbind Image#onerror', function() {
    var img = new Image
      , onerrorCalled = 0;


    img.onload = function() {
      assert.fail('called onload');
    };

    img.onerror = function() {
      onerrorCalled += 1;
    };

    img.src = png_clock + 's1';
    assert.equal(img.src, png_clock + 's1');

    assert.equal(onerrorCalled, 1);

    onerrorCalled = 0;
    img.onerror = null;
    img.src = png_clock + 's3';
    assert.equal(img.src, png_clock + 's3');
    assert.equal(onerrorCalled, 0);
  });
});
