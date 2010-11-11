
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , Image = Canvas.Image;

var png = __dirname + '/fixtures/clock.png';

module.exports = {
  'tset Image': function(assert){
    assert.ok(Image instanceof Function);
  },

  'test Image#onload': function(assert, beforeExit){
    var img = new Image
      , n = 0;

    assert.strictEqual(false, img.complete);
    img.onload = function(){
      assert.strictEqual(true, img.complete);
      ++n;
    };
    
    img.src = png;
    assert.equal(img.src, png);

    beforeExit(function(){
      assert.equal(1, n);
    });
  },
  
  'test Image#onerror': function(assert, beforeExit){
    var img = new Image
      , n = 0;

    assert.strictEqual(false, img.complete);
    img.onload = function(){
      assert.fail('called onload');
    };
    
    img.onerror = function(err){
      assert.strictEqual(false, img.complete);
      assert.ok(err instanceof Error, 'did not invoke onerror() with error');
      ++n;
    };
    
    img.src = png + 's';
    assert.equal(img.src, png + 's');

    beforeExit(function(){
      assert.equal(1, n);
    });
  }
};