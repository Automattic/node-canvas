
/**
 * Module dependencies.
 */

var Canvas = require('../')
  , Image = Canvas.Image
  , assert = require('assert')
  , fs = require('fs');

var png = __dirname + '/fixtures/clock.png';
var svg01 = __dirname + '/fixtures/1398275113_SDKs_copy_nodeJS.svg';
var svg02 = __dirname + '/fixtures/black_7_music_node.svg';

module.exports = {
  'test Image': function(){
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

  'test Image#onload svg': function(){
    test_onLoad(svg01, 100, 100);
    test_onLoad(svg02, 32, 32);
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

  'test Image#onload svg2png': function(){
    test_svg2png(svg01, 100, 100);
    test_svg2png(svg02, 32, 32);
  }
};

function test_onLoad(imgSrc, w, h) {
  var img = new Image
    , n = 0;

  assert.strictEqual(null, img.onload);

  assert.strictEqual(false, img.complete);
  img.onload = function(){
    ++n;
    assert.equal(img.src, imgSrc);
  };

  img.src = imgSrc;
  assert.equal(img.src, imgSrc);

  assert.equal(img.src, imgSrc);
  assert.strictEqual(true, img.complete);
  assert.strictEqual(w, img.width);
  assert.strictEqual(h, img.height);
  assert.equal(1, n); 
}

function test_svg2png(imgSrc, w, h) {
    var data = fs.readFileSync(imgSrc);
    assert.notStrictEqual(null, data);

    var b64data = data.toString('base64');
    var src = "data:image/svg+xml;base64," + b64data;

    var canvas = new Canvas(w, h)
       , ctx = canvas.getContext('2d');

    var img = new Image;
    img.onload = function(){
      assert.equal(img.src, '');
      assert.strictEqual(w, img.width);
      assert.strictEqual(h, img.height);

      ctx.drawImage(img, 0, 0);
      assert.ok(-1 != canvas.toBuffer().toString().indexOf('PNG'));
      assert.ok(0 == canvas.toDataURL().indexOf('data:image/png;base64,'));
      assert.ok(0 == canvas.toDataURL('image/png').indexOf('data:image/png;base64,'));
    };

    img.src = src;
    // since we read from buffer the 'src' attribute will be an empty string
    assert.equal(img.src, '');
}