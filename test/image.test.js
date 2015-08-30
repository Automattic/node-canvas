
/**
 * Module dependencies.
 */

var Canvas = require('../')
  , Image = Canvas.Image
  , assert = require('assert');

var png = __dirname + '/fixtures/clock.png';

module.exports = {
  'tset Image': function(){
    assert.ok(Image instanceof Function);
  },

  'test Image#onload': function(){
    var img = new Image
      , onloadCalled = 0;

    assert.strictEqual(null, img.onload);
    assert.strictEqual(false, img.complete);

    img.onload = function(){
      onloadCalled += 1;
      assert.strictEqual(img.src, png);
    };

    img.src = png;
    assert.strictEqual(1, onloadCalled);
    assert.strictEqual(img.src, png);

    assert.strictEqual(true, img.complete);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);
  },

  'test Image#onerror': function(){
    var img = new Image
      , error
      , onerrorCalled = 0;

    assert.strictEqual(null, img.onerror);
    assert.strictEqual(false, img.complete);

    img.onload = function(){
      assert.fail('called onload');
    };

    img.onerror = function(err){
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
  },

  'test Image#{width,height}': function(){
    var img = new Image
      , onloadCalled = 0;

    assert.strictEqual(0, img.width);
    assert.strictEqual(0, img.height);

    img.onload = function(){
      onloadCalled += 1;
      assert.strictEqual(320, img.width);
      assert.strictEqual(320, img.height);
    };

    img.src = png;
    assert.strictEqual(1, onloadCalled);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);
  },

  'test Image#src set empty buffer': function(){
    var image = new Canvas.Image();
    image.src = new Buffer(0);
    image.src = new Buffer('');
  }
};
