
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

    // hsl()
    assert.eql([255,0,0,1], parseColor('hsl(0,100.0,50.0)'));
    assert.eql([255,0,0,1], parseColor('hsl(360,100.0,50.0)'));
    assert.eql([0,255,0,1], parseColor('hsl(120,100.0,50.0)'));
    assert.eql([0,0,255,1], parseColor('hsl(240,100.0,50.0)'));
    assert.equal(null, parseColor('hsl()'));

    // adapted from tables at http://www.w3.org/TR/css3-color/#hsl-examples
    // NB:- corrected rounded percents to precise percents
    //      e.g. 13% --> 12.5%, etc.
    //   ...presumably the precise values were used to generate the tables?
    assert.eql(parseColor('#FFFFFF'), parseColor('hsl(0,100%,100%)'))
    assert.eql(parseColor('#FFFFFF'), parseColor('hsl(0,75%,100%)'))
    assert.eql(parseColor('#FFFFFF'), parseColor('hsl(0,50%,100%)'))
    assert.eql(parseColor('#FFFFFF'), parseColor('hsl(0,25%,100%)'))
    assert.eql(parseColor('#FFFFFF'), parseColor('hsl(0,0%,100%)'))
    assert.eql(parseColor('#FFBFBF'), parseColor('hsl(0,100%,87.5%)'))
    assert.eql(parseColor('#F7C7C7'), parseColor('hsl(0,75%,87.5%)'))
    assert.eql(parseColor('#EFCFCF'), parseColor('hsl(0,50%,87.5%)'))
    assert.eql(parseColor('#E7D7D7'), parseColor('hsl(0,25%,87.5%)'))
    assert.eql(parseColor('#DFDFDF'), parseColor('hsl(0,0%,87.5%)'))
    assert.eql(parseColor('#FF8080'), parseColor('hsl(0,100%,75%)'))
    assert.eql(parseColor('#EF8F8F'), parseColor('hsl(0,75%,75%)'))
    assert.eql(parseColor('#DF9F9F'), parseColor('hsl(0,50%,75%)'))
    assert.eql(parseColor('#CFAFAF'), parseColor('hsl(0,25%,75%)'))
    assert.eql(parseColor('#BFBFBF'), parseColor('hsl(0,0%,75%)'))
    assert.eql(parseColor('#FF4040'), parseColor('hsl(0,100%,62.5%)'))
    assert.eql(parseColor('#E75858'), parseColor('hsl(0,75%,62.5%)'))
    assert.eql(parseColor('#CF7070'), parseColor('hsl(0,50%,62.5%)'))
    assert.eql(parseColor('#B78787'), parseColor('hsl(0,25%,62.5%)'))
    assert.eql(parseColor('#9F9F9F'), parseColor('hsl(0,0%,62.5%)'))
    assert.eql(parseColor('#FF0000'), parseColor('hsl(0,100%,50%)'))
    assert.eql(parseColor('#DF2020'), parseColor('hsl(0,75%,50%)'))
    assert.eql(parseColor('#BF4040'), parseColor('hsl(0,50%,50%)'))
    assert.eql(parseColor('#9F6060'), parseColor('hsl(0,25%,50%)'))
    assert.eql(parseColor('#808080'), parseColor('hsl(0,0%,50%)'))
    assert.eql(parseColor('#BF0000'), parseColor('hsl(0,100%,37.5%)'))
    assert.eql(parseColor('#A71818'), parseColor('hsl(0,75%,37.5%)'))
    assert.eql(parseColor('#8F3030'), parseColor('hsl(0,50%,37.5%)'))
    assert.eql(parseColor('#784848'), parseColor('hsl(0,25%,37.5%)'))
    assert.eql(parseColor('#606060'), parseColor('hsl(0,0%,37.5%)'))
    assert.eql(parseColor('#800000'), parseColor('hsl(0,100%,25%)')) 
    assert.eql(parseColor('#701010'), parseColor('hsl(0,75%,25%)'))
    assert.eql(parseColor('#602020'), parseColor('hsl(0,50%,25%)'))
    assert.eql(parseColor('#503030'), parseColor('hsl(0,25%,25%)'))
    assert.eql(parseColor('#404040'), parseColor('hsl(0,0%,25%)'))
    assert.eql(parseColor('#400000'), parseColor('hsl(0,100%,12.5%)'))
    assert.eql(parseColor('#380808'), parseColor('hsl(0,75%,12.5%)'))
    assert.eql(parseColor('#301010'), parseColor('hsl(0,50%,12.5%)'))
    assert.eql(parseColor('#281818'), parseColor('hsl(0,25%,12.5%)'))
    assert.eql(parseColor('#202020'), parseColor('hsl(0,0%,12.5%)'))
    assert.eql(parseColor('#000000'), parseColor('hsl(0,100%,0%)'))
    assert.eql(parseColor('#000000'), parseColor('hsl(0,75%,0%)'))
    assert.eql(parseColor('#000000'), parseColor('hsl(0,50%,0%)'))
    assert.eql(parseColor('#000000'), parseColor('hsl(0,25%,0%)'))
    assert.eql(parseColor('#000000'), parseColor('hsl(0,0%,0%)'))
    
    // TODO: there are 11 more tables to adapt from
    // http://www.w3.org/TR/css3-color/#hsl-examples :)
    
    // hsla()
    assert.eql([255,0,0,1], parseColor('hsla(0,100.0,50.0,1.0)'));
    assert.eql([255,0,0,1], parseColor('hsla(360,100.0,50.0,1.0)'));
    assert.eql([0,255,0,1], parseColor('hsla(120,100.0,50.0,1.0)'));
    assert.eql([0,0,255,1], parseColor('hsla(240,100.0,50.0,1.0)'));
    assert.equal(null, parseColor('hsl()'));

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

      if ('shadowColor' == prop) return;

      var grad = ctx.createLinearGradient(0,0,0,150);
      ctx[prop] = grad;
      assert.strictEqual(grad, ctx[prop], prop + ' pattern getter failed');
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
  
  'test Context2d#antiAlias=': function(assert){
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
    var buf = new Canvas(200,200).toBuffer();
    assert.equal('PNG', buf.slice(1,4).toString());
  },
  
  'test Canvas#toBuffer() async': function(assert){
    new Canvas(200, 200).toBuffer(function(err, buf){
      assert.ok(!err);
      assert.equal('PNG', buf.slice(1,4).toString());
    });
  },
  
  'test Canvas#toDataURL()': function(assert){
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
  
  'test Canvas#toDataURL() async': function(assert){
    new Canvas(200,200).toDataURL(function(err, str){
      assert.ok(!err);
      assert.ok(0 == str.indexOf('data:image/png;base64,'));
    });
  },
  
  'test Canvas#toDataURL() async with type': function(assert){
    new Canvas(200,200).toDataURL('image/png', function(err, str){
      assert.ok(!err);
      assert.ok(0 == str.indexOf('data:image/png;base64,'));
    });
  },
  
  'test Context2d#createImageData(width, height)': function(assert){
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
  
  'test Context2d#createImageData(ImageData)': function(assert){
    var canvas = new Canvas(20, 20)
      , ctx = canvas.getContext('2d');
    
    var imageData = ctx.createImageData(ctx.createImageData(2, 6));
    assert.equal(2, imageData.width);
    assert.equal(6, imageData.height);
    assert.equal(2 * 6 * 4, imageData.data.length);
  },
  
  'test Context2d#getImageData()': function(assert){
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