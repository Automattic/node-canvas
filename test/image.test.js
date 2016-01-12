
/**
 * Module dependencies.
 */

var Canvas = require('../')
  , Image = Canvas.Image
  , assert = require('assert');

var png_checkers = __dirname + '/fixtures/checkers.png';
var png = __dirname + '/fixtures/clock.png';

describe('Image', function () {
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
      assert.strictEqual(img.src, png);
    };

    img.src = png;
    assert.strictEqual(1, onloadCalled);
    assert.strictEqual(img.src, png);

    assert.strictEqual(true, img.complete);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);
  });

  it('test Image#onload multiple times', function() {
    var img = new Image
      , n = 0;

    img.onload = function() {
      ++n;
    };

    img.src = png_checkers;
    assert.equal(img.src, png_checkers);
    assert.strictEqual(true, img.complete);
    assert.strictEqual(2, img.width);
    assert.strictEqual(2, img.height);

    img.src = png;
    assert.equal(img.src, png);
    assert.strictEqual(true, img.complete);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);

    assert.equal(n, 2);

    n = 0;
    img.onload = function() {
      ++n;
    };
    img.src = png;
    assert.equal(n, 1);
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
      img.src = png + 's';
    } catch (err) {
      assert.fail('error did not invoke onerror(): ' + err);
    }

    assert.strictEqual(1, onerrorCalled);
    assert.strictEqual(img.src, png + 's');
    assert.strictEqual(false, img.complete);

    assert.ok(error instanceof Error, 'did not invoke onerror() with error');
  });

  it('test Image#onerror multiple calls', function() {
    var img = new Image
      , n = 0;


    img.onload = function() {
      assert.fail('called onload');
    };

    img.onerror = function() {
      ++n;
    };

    img.src = png + 's1';
    assert.equal(img.src, png + 's1');

    img.src = png + 's2';
    assert.equal(img.src, png + 's2');

    assert.equal(n, 2);

    n = 0;
    img.onerror = function() {
      ++n;
    };
    img.src = png + 's3';
    assert.equal(img.src, png + 's3');
    assert.equal(n, 1);
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

    img.src = png;
    assert.strictEqual(1, onloadCalled);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);
  });

  it('Image#src set empty buffer', function () {
    var image = new Canvas.Image();
    image.src = new Buffer(0);
    image.src = new Buffer('');
  });
});
