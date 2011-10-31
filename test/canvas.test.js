
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , assert = require('assert')
  , parseFont = Canvas.Context2d.parseFont
  , assert = require('assert')
  , sys = require('sys')
  , fs = require('fs');

console.log();
console.log('   canvas: %s', Canvas.version);
console.log('   cairo: %s', Canvas.cairoVersion);

module.exports = {
  'test .version': function(){
    assert.match(Canvas.version, /^\d+\.\d+\.\d+$/);
  },
  
  'test .cairoVersion': function(){
    assert.match(Canvas.cairoVersion, /^\d+\.\d+\.\d+$/);
  },
  
  'test .parseFont()': function(){
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
      , { size: 50, unit: 'px', family: 'Arial, sans-serif' }
      , 'bold italic 50px Arial, sans-serif'
      , { style: 'italic', weight: 'bold', size: 50, unit: 'px', family: 'Arial, sans-serif' }
      , '50px Helvetica ,  Arial, sans-serif'
      , { size: 50, unit: 'px', family: 'Helvetica ,  Arial, sans-serif' }
      , '50px "Helvetica Neue", sans-serif'
      , { size: 50, unit: 'px', family: 'Helvetica Neue, sans-serif' }
      , '50px "Helvetica Neue", "foo bar baz" , sans-serif'
      , { size: 50, unit: 'px', family: 'Helvetica Neue, foo bar baz , sans-serif' }
      , "50px 'Helvetica Neue'"
      , { size: 50, unit: 'px', family: "Helvetica Neue" }
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
        , got = parseFont(str);
      if (!obj.style) obj.style = 'normal';
      if (!obj.weight) obj.weight = 'normal';
      assert.eql(obj, got, ''
        + '\n   from: ' + sys.inspect(str)
        + '\n   got:\n' + sys.inspect(got) 
        + '\n   expected:\n' + sys.inspect(obj));
    }
  },
  
  'test color serialization': function(){
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
  },
  
  'test color parser': function(){
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
  },
  
  'test Canvas#getContext("2d")': function(){
    var canvas = new Canvas(200, 300)
      , ctx = canvas.getContext('2d');
    assert.ok('object' == typeof ctx);
    assert.equal(canvas, ctx.canvas, 'context.canvas is not canvas');
    assert.equal(ctx, canvas.context, 'canvas.context is not context');
  },
  
  'test Canvas#{width,height}=': function(){
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
  },
  
  'test Canvas#getContext("invalid")': function(){
    assert.equal(null, new Canvas(200, 300).getContext('invalid'));
  },
  
  'test Context2d#patternQuality': function(){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');
    
    assert.equal('good', ctx.patternQuality);
    ctx.patternQuality = 'best';
    assert.equal('best', ctx.patternQuality);
    ctx.patternQuality = 'invalid';
    assert.equal('best', ctx.patternQuality);
  },
  
  'test Context2d#font=': function(){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');
    
    assert.equal('10px sans-serif', ctx.font);
    ctx.font = '15px Arial, sans-serif';
    assert.equal('15px Arial, sans-serif', ctx.font);
  },
  
  'test Context2d#lineWidth=': function(){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    ctx.lineWidth = 10.0;
    assert.equal(10, ctx.lineWidth);
    // ctx.lineWidth = Infinity;
    assert.equal(10, ctx.lineWidth);
    ctx.lineWidth = -5;
    assert.equal(10, ctx.lineWidth);
    ctx.lineWidth = 0;
    assert.equal(10, ctx.lineWidth);
  },
  
  'test Context2d#antiAlias=': function(){
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
  },
  
  'test Context2d#lineCap=': function(){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('butt', ctx.lineCap);
    ctx.lineCap = 'round';
    assert.equal('round', ctx.lineCap);
  },
  
  'test Context2d#lineJoin=': function(){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('miter', ctx.lineJoin);
    ctx.lineJoin = 'round';
    assert.equal('round', ctx.lineJoin);
  },

  
  'test Context2d#globalAlpha=': function(){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');
    
    assert.equal(1, ctx.globalAlpha);
    ctx.globalAlpha = 0.5
    assert.equal(0.5, ctx.globalAlpha);
  },
  
  'test Context2d#isPointInPath()': function(){
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
  },

  'test Context2d#textAlign': function(){
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
  },
  
  'test Canvas#toBuffer()': function(){
    var buf = new Canvas(200,200).toBuffer();
    assert.equal('PNG', buf.slice(1,4).toString());
  },
  
  'test Canvas#toBuffer() async': function(){
    new Canvas(200, 200).toBuffer(function(err, buf){
      assert.ok(!err);
      assert.equal('PNG', buf.slice(1,4).toString());
    });
  },
  
  'test Canvas#toDataURL()': function(){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    ctx.fillRect(0,0,100,100);
    ctx.fillStyle = 'red';
    ctx.fillRect(100,0,100,100);
    
    assert.ok(0 == canvas.toDataURL().indexOf('data:image/png;base64,'));
    assert.ok(0 == canvas.toDataURL('image/png').indexOf('data:image/png;base64,'));

    var err;
    try {
      canvas.toDataURL('image/jpeg');
    } catch (e) {
      err = e;
    }
    assert.equal('currently only image/png is supported', err.message);
  },
  
  'test Canvas#toDataURL() async': function(){
    new Canvas(200,200).toDataURL(function(err, str){
      assert.ok(!err);
      assert.ok(0 == str.indexOf('data:image/png;base64,'));
    });
  },
  
  'test Canvas#toDataURL() async with type': function(){
    new Canvas(200,200).toDataURL('image/png', function(err, str){
      assert.ok(!err);
      assert.ok(0 == str.indexOf('data:image/png;base64,'));
    });
  },
  
  'test Context2d#createImageData(width, height)': function(){
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
  },
  
  'test Context2d#measureText().width': function(){
    var canvas = new Canvas(20, 20)
      , ctx = canvas.getContext('2d');

    assert.ok(ctx.measureText('foo').width);
    assert.ok(ctx.measureText('foo').width != ctx.measureText('foobar').width);
    assert.ok(ctx.measureText('foo').width != ctx.measureText('  foo').width);
  },
  
  'test Context2d#createImageData(ImageData)': function(){
    var canvas = new Canvas(20, 20)
      , ctx = canvas.getContext('2d');
    
    var imageData = ctx.createImageData(ctx.createImageData(2, 6));
    assert.equal(2, imageData.width);
    assert.equal(6, imageData.height);
    assert.equal(2 * 6 * 4, imageData.data.length);
  },
  
  'test Context2d#getImageData()': function(){
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
  }
}