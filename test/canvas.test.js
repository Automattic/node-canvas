
/**
 * Module dependencies.
 */

var Canvas = require('canvas')
  , assert = require('assert')
  , crypto = require('crypto')
  , fs = require('fs');

function hash(val) {
  return crypto.createHash('md5').update(val).digest('hex');
}

function assertChecksum(canvas, path, checksum, msg) {
  canvas.savePNG(path);
  fs.readFile(path, function(err, buf){
    assert.equal(hash(buf), checksum, msg);  
  });
}

module.exports = {
  'test .version': function(assert){
    assert.match(Canvas.version, /^\d+\.\d+\.\d+$/);
  },
  
  'test .parseColor()': function(assert){
    assert.equal(null, Canvas.parseColor());
    assert.equal(null, Canvas.parseColor(''));

    // rgb()
    assert.eql([255,165,0,1], Canvas.parseColor('rgb(255,165,0)'));
    assert.eql([255,165,0,1], Canvas.parseColor('rgb(255, 165, 0)'));
    assert.eql([255,165,0,1], Canvas.parseColor('rgb(255 , 165 , 0)'));
    assert.equal(null, Canvas.parseColor('rgb()'));

    // rgba()
    assert.eql([255,165,0,1], Canvas.parseColor('rgba(255,165,0,1)'));
    assert.eql([255,165,0,1], Canvas.parseColor('rgba(255,165,0,1)'));
    assert.eql([255,165,0,.6], Canvas.parseColor('rgba(255,165,0,0.6)'));
    assert.eql([255,165,0,.6], Canvas.parseColor('rgba(255,165, 0, 0.6)'));
    assert.eql([255,165,0,.6], Canvas.parseColor('rgba(255,165 , 0 ,.6)'));
    assert.equal(null, Canvas.parseColor('rgba(2554,165 , 0 ,.6)'));
    assert.equal(null, Canvas.parseColor('rgba()'));

    // hex
    assert.eql([165,89,89,1], Canvas.parseColor('#A55959'));
    assert.eql([255,255,255,1], Canvas.parseColor('#FFFFFF'));
    assert.eql([255,255,255,1], Canvas.parseColor('#ffffff'));
    assert.eql([255,255,255,1], Canvas.parseColor('#FFF'));
    assert.eql([255,255,255,1], Canvas.parseColor('#fff'));

    // name
    assert.eql([255,255,255,1], Canvas.parseColor('white'));
    assert.eql([0,0,0,1], Canvas.parseColor('black'));
  },
  
  'test Canvas#getContext("2d")': function(assert){
    var canvas = new Canvas(200, 300)
      , ctx = canvas.getContext('2d');
    assert.ok('object' == typeof ctx);
    assert.equal(canvas, ctx.canvas, 'context.canvas is not canvas');
    assert.equal(ctx, canvas.context, 'canvas.context is not context');
  },
  
  'test Canvas#getContext("invalid")': function(assert){
    assert.equal(null, new Canvas(200, 300).getContext('invalid'));
  },
  
  'test Context2d#clearRect()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/clearRect.png';
    
    ctx.fillRect(25,25,100,100);
    ctx.clearRect(45,45,60,60);
    ctx.fillRect(50,50,50,50);
    
    assertChecksum(
        canvas
      , path
      , 'e21404e97142a76c0c8d14cf0fab400f'
      , 'Context2d#clearRect() failed');
  },
  
  'test Context2d#strokeRect()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/strokeRect.png';
    
    ctx.fillRect(25,25,100,100);
    ctx.clearRect(45,45,60,60);
    ctx.strokeRect(50,50,50,50);
    
    assertChecksum(
        canvas
      , path
      , '1cd349f7d3d2ae5a2bce13ca35dcaa94'
      , 'Context2d#strokeRect() failed');
  },
  
  'test Context2d#lineTo()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/lineTo.png';
    
    // Filled triangle
    ctx.beginPath();
    ctx.moveTo(25.5,25);
    ctx.lineTo(105,25);
    ctx.lineTo(25,105);
    ctx.fill();

    // Stroked triangle
    ctx.beginPath();
    ctx.moveTo(125,125);
    ctx.lineTo(125,45);
    ctx.lineTo(45,125);
    ctx.closePath();
    ctx.stroke();
    
    assertChecksum(
        canvas
      , path
      , '44cce447dcb15918c9baf9170f87911f'
      , 'Context2d#lineTo() failed'
      );
  },
  
  'test Context2d#arc()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/arc.png';
    
    ctx.beginPath();
    ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
    ctx.moveTo(110,75);
    ctx.arc(75,75,35,0,Math.PI,false);   // Mouth
    ctx.moveTo(65,65);
    ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
    ctx.moveTo(95,65);
    ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
    ctx.stroke();
    
    assertChecksum(
        canvas
      , path
      , '3c48a221b24c582f46e39c16678b12dd'
      , 'Context2d#arc() failed');
  },
  
  'test Context2d#bezierCurveTo()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/bezierCurveTo.png';
    
    ctx.beginPath();
    ctx.moveTo(75,40);
    ctx.bezierCurveTo(75,37,70,25,50,25);
    ctx.bezierCurveTo(20,25,20,62.5,20,62.5);
    ctx.bezierCurveTo(20,80,40,102,75,120);
    ctx.bezierCurveTo(110,102,130,80,130,62.5);
    ctx.bezierCurveTo(130,62.5,130,25,100,25);
    ctx.bezierCurveTo(85,25,75,37,75,40);
    ctx.fill();

    assertChecksum(
        canvas
      , path
      , '5626a53780d77aecc490ec807ee0bc63'
      , 'Context2d#bezierCurveTo() failed');
  },
  
  'test Context2d#rotate()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/rotate.png';
    
    ctx.rotate(0.4);
    ctx.translate(30,0);
    ctx.rect(0,0,50,50);
    ctx.stroke();
    
    assertChecksum(
        canvas
      , path
      , 'f60ba975e224d6f6a93af0c656d739d5'
      , 'Context2d#rotate() failed');
  },
  
  'test fill with stroke': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/fillWithStroke.png';

    ctx.beginPath();
    ctx.arc(75,75,50,0,Math.PI*2,true);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'yellow';
    ctx.arc(75,75,30,0,Math.PI*2,true);
    ctx.fill();
    ctx.stroke();

    assertChecksum(
        canvas
      , path
      , '0437605377cc9840c58cb166fb0b89d4'
      , 'fill with stroke failed');
  },
  
  'test Context2d#rect()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/rect.png';
    
    ctx.rect(5,5,50,50);
    ctx.strokeStyle = 'yellow';
    ctx.fill();
    ctx.stroke();
    
    assertChecksum(
        canvas
      , path
      , '2909bb99d128e3ea1ee839b73dc1a0ed'
      , 'Context2d#rect() failed');
  },
  
  'test Context2d#fillStyle=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/fillStyle.png';
    
    ctx.fillStyle = '#000';
    ctx.fillRect(110, 110, 50, 50);
    assert.equal('rgba(0,0,0,1)', ctx.fillStyle);

    ctx.fillStyle = 'rgb(0,55,0)';
    ctx.fillRect(10, 10, 50, 50);
    assert.equal('rgba(0,55,0,1)', ctx.fillStyle);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(60, 60, 50, 50);
    assert.equal('rgba(0,0,0,0.5)', ctx.fillStyle);

    assertChecksum(
        canvas
      , path
      , '01632d060ba4702a53862a955382d30d'
      , 'Context2d#fillStyle= failed');
  },
  
  'test Context2d#lineWidth=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/lineWidth.png';

    ctx.beginPath();
    ctx.lineWidth = 10.0;
    assert.equal(10, ctx.lineWidth);
    ctx.moveTo(50, 50);
    ctx.lineTo(50, 100);
    ctx.lineTo(80, 120);
    ctx.stroke();

    assertChecksum(
        canvas
      , path
      , '0bc6f64d58f326ca7ad3ade4426fb90f'
      , 'Context2d#lineWidth= failed');
  },
  
  'test Context2d#lineCap=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/lineCap.png';

    ctx.beginPath();
    ctx.lineWidth = 10.0;
    ctx.lineCap = 'round';
    assert.equal('round', ctx.lineCap);
    ctx.moveTo(50, 50);
    ctx.lineTo(50, 100);
    ctx.lineTo(80, 120);
    ctx.stroke();

    assertChecksum(
        canvas
      , path
      , 'd5b84ea10a3e6df723b702a32329ed43'
      , 'Context2d#lineCap= failed');
  },
  
  'test Context2d#lineJoin=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/lineJoin.png';

    ctx.beginPath();
    ctx.lineWidth = 10.0;
    ctx.lineJoin = 'round';
    assert.equal('round', ctx.lineJoin);
    ctx.moveTo(50, 50);
    ctx.lineTo(50, 100);
    ctx.lineTo(80, 120);
    ctx.stroke();

    assertChecksum(
        canvas
      , path
      , 'bf97d882a0e99595109fb4f564fa41bf'
      , 'Context2d#lineJoin= failed');
  }
}