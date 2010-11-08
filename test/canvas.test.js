
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , assert = require('assert')
  , parseColor = Canvas.Context2d.parseColor
  , parseFont = Canvas.Context2d.parseFont
  , sys = require('sys')
  , fs = require('fs');

module.exports = {
  'test .version': function(assert){
    assert.match(Canvas.version, /^\d+\.\d+\.\d+$/);
  },
  
  'test .cairoVersion': function(assert){
    assert.match(Canvas.cairoVersion, /^\d+\.\d+\.\d+$/);
  },
  
  'test .parseColor()': function(assert){
    assert.equal(null, parseColor());
    assert.equal(null, parseColor(''));

    // rgb()
    assert.eql([255,165,0,1], parseColor('rgb(255,165,0)'));
    assert.eql([255,165,0,1], parseColor('rgb(255, 165, 0)'));
    assert.eql([255,165,0,1], parseColor('rgb(255 , 165 , 0)'));
    assert.equal(null, parseColor('rgb()'));

    // rgba()
    assert.eql([255,165,0,1], parseColor('rgba(255,165,0,1)'));
    assert.eql([255,165,0,1], parseColor('rgba(255,165,0,1)'));
    assert.eql([255,165,0,.6], parseColor('rgba(255,165,0,0.6)'));
    assert.eql([255,165,0,.6], parseColor('rgba(255,165, 0, 0.6)'));
    assert.eql([255,165,0,.6], parseColor('rgba(255,165 , 0 ,.6)'));
    assert.equal(null, parseColor('rgba(2554,165 , 0 ,.6)'));
    assert.equal(null, parseColor('rgba()'));

    // hex
    assert.eql([165,89,89,1], parseColor('#A55959'));
    assert.eql([255,255,255,1], parseColor('#FFFFFF'));
    assert.eql([255,255,255,1], parseColor('#ffffff'));
    assert.eql([255,255,255,1], parseColor('#FFF'));
    assert.eql([255,255,255,1], parseColor('#fff'));

    // name
    assert.eql([255,255,255,1], parseColor('white'));
    assert.eql([0,0,0,1], parseColor('black'));
  },
  
  'test .parseFont()': function(assert){
    var tests = [
        '20px Arial'
      , { size: 20, unit: 'px', family: 'Arial' }
      , '20pt Arial'
      , { size: 20, unit: 'pt', family: 'Arial' }
      , '20.5pt Arial'
      , { size: 20.5, unit: 'pt', family: 'Arial' }
      , '20% Arial'
      , { size: 20, unit: '%', family: 'Arial' }
      , '20mm Arial'
      , { size: 20, unit: 'mm', family: 'Arial' }
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
      , '50px "Helvetica Nueue", sans-serif'
      , { size: 50, unit: 'px', family: '"Helvetica Nueue", sans-serif' }
      , '50px "Helvetica Nueue", "foo bar baz" , sans-serif'
      , { size: 50, unit: 'px', family: '"Helvetica Nueue", "foo bar baz" , sans-serif' }
      , "50px 'Helvetica Nueue'"
      , { size: 50, unit: 'px', family: "'Helvetica Nueue'" }
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
      assert.equal('rgba(128, 80, 0, 0.5)', ctx[prop], prop + ' rgba(128,80,0,0.5) -> rgba(128, 80, 0, 0.5), got ' + ctx[prop]);
    });
  },
  
  'test Canvas#getContext("2d")': function(assert){
    var canvas = new Canvas(200, 300)
      , ctx = canvas.getContext('2d');
    assert.ok('object' == typeof ctx);
    assert.equal(canvas, ctx.canvas, 'context.canvas is not canvas');
    assert.equal(ctx, canvas.context, 'canvas.context is not context');
  },
  
  'test Canvas#{width,height}=': function(assert){
    var canvas = new Canvas(100, 200);
    assert.equal(100, canvas.width);
    assert.equal(200, canvas.height);
    canvas = new Canvas;
    canvas.width = 50;
    canvas.height = 50;
    assert.equal(50, canvas.width);
    assert.equal(50, canvas.height);
  },
  
  'test Canvas#getContext("invalid")': function(assert){
    assert.equal(null, new Canvas(200, 300).getContext('invalid'));
  },
  
  'test Context2d#font=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');
    
    assert.equal('10px sans-serif', ctx.font);
    ctx.font = '15px Arial, sans-serif';
    assert.equal('15px Arial, sans-serif', ctx.font);
  },
  
  'test Context2d#lineWidth=': function(assert){
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
  
  'test Context2d#lineCap=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('butt', ctx.lineCap);
    ctx.lineCap = 'round';
    assert.equal('round', ctx.lineCap);
  },
  
  'test Context2d#lineJoin=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    assert.equal('miter', ctx.lineJoin);
    ctx.lineJoin = 'round';
    assert.equal('round', ctx.lineJoin);
  },

  
  'test Context2d#globalAlpha=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');
    
    assert.equal(1, ctx.globalAlpha);
    ctx.globalAlpha = 0.5
    assert.equal(0.5, ctx.globalAlpha);
  },
  
  'test Context2d#isPointInPath()': function(assert){
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

  'test Context2d#textAlign': function(assert){
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
  
  'test Canvas#toBuffer()': function(assert){
    assert.ok(Buffer.isBuffer(new Canvas(200, 200).toBuffer()), 'Canvas#toBuffer() failed');
  },
  
  'test Canvas#toDataURL()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d');

    ctx.fillRect(0,0,100,100);
    ctx.fillStyle = 'red';
    ctx.fillRect(100,0,100,100);

    var str = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYA'
      + 'AACtWK6eAAAABmJLR0QA/wD/AP+gvaeTAAABbElEQVR4nO3TQQ0AMQwDwVz5c+4x2'
      + 'G/zmEFgydpvZu6whjN2Oa8HwGYCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEA'
      + 'gCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgSA'
      + 'QCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBI'
      + 'BAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEg'
      + 'EAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQCAKBIBAIAoEgEAgCgSAQ'
      + 'CAKBIBAIAoEgEAgCgSAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      + 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAhX5bnALGvZc/ggA'
      + 'AAABJRU5ErkJggg==';
    
    assert.equal(str, canvas.toDataURL(), 'Canvas#toDataURL() failed');
    assert.equal(str, canvas.toDataURL('image/png'), 'Canvas#toDataURL() failed');
    
    var err;
    try {
      canvas.toDataURL('image/jpeg');
    } catch (e) {
      err = e;
    }
    assert.equal('currently only image/png is supported', err.message);
  }
}