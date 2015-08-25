
/**
 * Module dependencies.
 */

var Canvas = require('../')
  , Image = Canvas.Image
  , assert = require('assert');

var png_checkers = __dirname + '/fixtures/checkers.png';
var png = __dirname + '/fixtures/clock.png';

module.exports = {
  'tset Image': function(){
    assert.ok(Image instanceof Function);
  },

  'test Image#onload': function(){
    var img = new Image
      , n = 0;

    assert.strictEqual(null, img.onload);

    assert.strictEqual(false, img.complete);
    img.onload = function(){
      ++n;
      assert.equal(img.src, png);
    };

    img.src = png;
    assert.equal(img.src, png);

    assert.equal(img.src, png);
    assert.strictEqual(true, img.complete);
    assert.strictEqual(320, img.width);
    assert.strictEqual(320, img.height);
    assert.equal(1, n);
  },
  
  'test Image#onload multiple times': function() {
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
  },

  'test Image#onerror': function(){
    var img = new Image
      , error
      , n = 0;

    assert.strictEqual(null, img.onerror);

    assert.strictEqual(false, img.complete);
    img.onload = function(){
      assert.fail('called onload');
    };
    
    img.onerror = function(err){
      ++n;
      error = err;
    };

    try {
      img.src = png + 's';
    } catch (err) {
      assert.fail('error did not invoke onerror(): ' + err);
    }

    assert.equal(img.src, png + 's');

    assert.ok(error instanceof Error, 'did not invoke onerror() with error');
    assert.strictEqual(false, img.complete);
    assert.equal(1, n);
  },
  
  'test Image#onerror multiple calls': function() {
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
  },

  'test Image#{width,height}': function(){
    var img = new Image
      , n = 0;
    
    assert.strictEqual(0, img.width);
    assert.strictEqual(0, img.height);
    img.onload = function(){
      ++n;
      assert.strictEqual(320, img.width);
      assert.strictEqual(320, img.height);
    };
    img.src = png;

    assert.equal(1, n);
  },

  'test Image#src set empty buffer': function(){
    var image = new Canvas.Image();
    image.src = new Buffer(0);
    image.src = new Buffer('');
  }
};
