
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , Image = Canvas.Image
  , assert = require('assert');

var png = __dirname + '/fixtures/clock.png';

module.exports = {
  'tset Image': function(){
    assert.ok(Image instanceof Function);
  },

  'test Image#onload': function(beforeExit){
    var img = new Image
      , n = 0;

    assert.strictEqual(false, img.complete);
    img.onload = function(){
      ++n;
      assert.equal(img.src, png);
    };

    img.src = png;
    assert.equal(img.src, png);

    beforeExit(function(){
      assert.equal(img.src, png);
      assert.strictEqual(true, img.complete);
      assert.strictEqual(320, img.width);
      assert.strictEqual(320, img.height);
      assert.equal(1, n);
    });
  },
  
  'test Image#onerror': function(beforeExit){
    var img = new Image
      , error
      , n = 0;

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

    beforeExit(function(){
      assert.ok(error instanceof Error, 'did not invoke onerror() with error');
      assert.strictEqual(false, img.complete);
      assert.equal(1, n);
    });
  },
  
  'test Image#{width,height}': function(beforeExit){
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

    beforeExit(function(){
      assert.equal(1, n);
    });
  }
};