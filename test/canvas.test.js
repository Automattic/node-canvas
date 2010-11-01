
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
  assertChecksumOf(canvas, path, checksum, msg);
}

function assertChecksumOf(canvas, path, checksum, msg) {
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
  
  'test Canvas#getContext("invalid")': function(assert){
    assert.equal(null, new Canvas(200, 300).getContext('invalid'));
  },
  
  'test Context2d#clearRect()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/clearRect.png';
    
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
      , path = __dirname + '/images/strokeRect.png';
    
    ctx.fillRect(25,25,100,100);
    ctx.clearRect(45,45,60,60);
    ctx.strokeRect(50,50,50,50);
    
    assertChecksum(
        canvas
      , path
      , '130c5457e19da9d35b46970c2c3e035f'
      , 'Context2d#strokeRect() failed');
  },
  
  'test Context2d#lineTo()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/lineTo.png';
    
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
      , 'eb265249dc3d0fc7dc2008d2f5b905fa'
      , 'Context2d#lineTo() failed'
      );
  },
  
  'test Context2d#arc()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/arc.png';
    
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
      , '82997bc57c3941afea72ba571d713160'
      , 'Context2d#arc() failed');
  },
  
  'test Context2d#bezierCurveTo()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/bezierCurveTo.png';
    
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
  
  'test Context2d#quadraticCurveTo()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/quadraticCurveTo.png';
    
    ctx.beginPath();
    ctx.moveTo(75,25);
    ctx.quadraticCurveTo(25,25,25,62.5);
    ctx.quadraticCurveTo(25,100,50,100);
    ctx.quadraticCurveTo(50,120,30,125);
    ctx.quadraticCurveTo(60,120,65,100);
    ctx.quadraticCurveTo(125,100,125,62.5);
    ctx.quadraticCurveTo(125,25,75,25);
    ctx.stroke();

    assertChecksum(
        canvas
      , path
      , '4995ce059b78d8b78652d9f6d2d1a6f2'
      , 'Context2d#quadraticCurveTo() failed');
  },
  
  'test Context2d#rotate()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/rotate.png';
    
    ctx.rotate(0.4);
    ctx.translate(30,0);
    ctx.rect(0,0,50,50);
    ctx.stroke();
    
    assertChecksum(
        canvas
      , path
      , 'b364d4572f8b4fe03e1290235dcf2e55'
      , 'Context2d#rotate() failed');
  },
  
  'test fill with stroke': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/fillWithStroke.png';

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
      , '603b1e1c8a4bc0048c9a0944c83e82f4'
      , 'fill with stroke failed');
  },
  
  'test Context2d#rect()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/rect.png';
    
    ctx.rect(5,5,50,50);
    ctx.strokeStyle = 'yellow';
    ctx.fill();
    ctx.stroke();
    
    assertChecksum(
        canvas
      , path
      , 'a670979e566eafa07e3938aec9e2b7a3'
      , 'Context2d#rect() failed');
  },
  
  'test Context2d#fillStyle=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/fillStyle.png';

    ctx.fillStyle = 'rgb(0,55,0)';
    ctx.fillRect(10, 10, 50, 50);

    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(60, 60, 50, 50);

    ctx.fillStyle = '#000';
    ctx.fillRect(110, 110, 50, 50);

    assertChecksum(
        canvas
      , path
      , '804d2494db2eeda204ccbd6d0b48265a'
      , 'Context2d#fillStyle= failed');
  },
  
  'test Context2d#lineWidth=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/lineWidth.png';

    ctx.beginPath();
    ctx.lineWidth = 10.0;
    assert.equal(10, ctx.lineWidth);
    // ctx.lineWidth = Infinity;
    assert.equal(10, ctx.lineWidth);
    ctx.lineWidth = -5;
    assert.equal(10, ctx.lineWidth);
    ctx.lineWidth = 0;
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
      , path = __dirname + '/images/lineCap.png';

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
      , path = __dirname + '/images/lineJoin.png';

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
  },
  
  'test Context2d states': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/states.png';
    
    ctx.arc(5,5,-1)
    ctx.save();
    ctx.rect(50, 50, 100, 100);
    ctx.stroke();

    ctx.restore();
    ctx.save();
    ctx.translate(50,50);
    ctx.scale(.5,.5);
    ctx.strokeRect(51, 51, 100, 100);

    ctx.restore();
    ctx.translate(95,95);
    ctx.fillRect(0,0,10,10);
    
    assertChecksum(
        canvas
      , path
      , 'fc8bbf2cf6ae2d85fcf526103200e844'
      , 'Context2d#save() / restore() failed');
  },
  
  'test Context2d states with stroke/fill/globalAlpha': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/states2.png';
    
    ctx.fillRect(0,0,150,150);   // Draw a rectangle with default settings
    ctx.save();                  // Save the default state
    
    ctx.fillStyle = '#09F'       // Make changes to the settings
    ctx.fillRect(15,15,120,120); // Draw a rectangle with new settings
    
    ctx.save();                  // Save the current state
    ctx.fillStyle = '#FFF'       // Make changes to the settings
    ctx.globalAlpha = 0.5;    
    ctx.fillRect(30,30,90,90);   // Draw a rectangle with new settings
    
    ctx.restore();               // Restore previous state
    ctx.fillRect(45,45,60,60);   // Draw a rectangle with restored settings
    
    ctx.restore();               // Restore original state
    ctx.fillRect(60,60,30,30);   // Draw a rectangle with restored settings

    assertChecksum(
        canvas
      , path
      , 'c7217b183c3b47e76a0454d8f5a8b424'
      , 'Context#save() / restore() with stroke/fill/globalAlpha failed');
  },
  
  'test Context2d#globalAlpha=': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/globalAlpha.png';

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.strokeRect(0,0,50,50);

    ctx.globalAlpha = 0.8;
    ctx.fillRect(20,20,20,20);

    ctx.fillStyle = 'black';
    ctx.globalAlpha = 1;
    ctx.fillRect(25,25,10,10);
    
    assertChecksum(
        canvas
      , path
      , 'feb3e3c4bc6aac5c9e46f9b71b4504c6'
      , 'Context2d#globalAlpha= failed');
  },
  
  'test Context2d#createLinearGradient()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/linearGradients.png';
    
    var lingrad = ctx.createLinearGradient(0,0,0,150);
    lingrad.addColorStop(0, '#00ABEB');
    lingrad.addColorStop(0.5, '#fff');
    lingrad.addColorStop(0.5, '#26C000');
    lingrad.addColorStop(1, '#fff');

    var lingrad2 = ctx.createLinearGradient(0,50,0,95);
    lingrad2.addColorStop(0.5, '#000');
    lingrad2.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = lingrad;
    ctx.strokeStyle = lingrad2;

    ctx.fillRect(10,10,130,130);
    ctx.strokeRect(50,50,50,50);
   
    assertChecksum(
        canvas
      , path
      , '55f80d7d33000904ca366e0cfe363079'
      , 'Context2d#createLinearGradient() failed');
  },
  
  'test Context2d#createRadialGradient()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/radialGradients.png';
    
    // Create gradients
    var radgrad = ctx.createRadialGradient(45,45,10,52,50,30);
    radgrad.addColorStop(0, '#A7D30C');
    radgrad.addColorStop(0.9, '#019F62');
    radgrad.addColorStop(1, 'rgba(1,159,98,0)');

    var radgrad2 = ctx.createRadialGradient(105,105,20,112,120,50);
    radgrad2.addColorStop(0, '#FF5F98');
    radgrad2.addColorStop(0.75, '#FF0188');
    radgrad2.addColorStop(1, 'rgba(255,1,136,0)');

    var radgrad3 = ctx.createRadialGradient(95,15,15,102,20,40);
    radgrad3.addColorStop(0, '#00C9FF');
    radgrad3.addColorStop(0.8, '#00B5E2');
    radgrad3.addColorStop(1, 'rgba(0,201,255,0)');

    var radgrad4 = ctx.createRadialGradient(0,150,50,0,140,90);
    radgrad4.addColorStop(0, '#F4F201');
    radgrad4.addColorStop(0.8, '#E4C700');
    radgrad4.addColorStop(1, 'rgba(228,199,0,0)');

    // draw shapes
    ctx.fillStyle = radgrad4;
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle = radgrad3;
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle = radgrad2;
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle = radgrad;
    ctx.fillRect(0,0,150,150);

    assertChecksum(
        canvas
      , path
      , 'd078f5993eb962a5b3fdde5ca0864179'
      , 'Context2d#createRadialGradient() failed');
  },
  
  'test invalid {fill,stroke}Style': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/invalidStyle.png';
    
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'yellow';
    ctx.rect(50,50,50,50);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = 'asdf';
    ctx.strokeStyle = 'asdf';
    ctx.rect(100,80,15,15);
    ctx.fill();
    ctx.stroke();
    
    assertChecksum(
        canvas
      , path
      , '2ba95ccadd5c38949a5ea493dbc78e08'
      , 'Context2d invalid fillStyle did not retain previous value');
    
  },
  
  'test Context2d#clip()': function(assert){
    var canvas = new Canvas(200, 200)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/clip.png';
    
    ctx.arc(50,50,50,0,Math.PI * 2);
    ctx.stroke();
    ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(0,0,100,100);
    
    assertChecksum(
        canvas
      , path
      , '6199442d05718481ac5ccd034239f6f1'
      , 'Context2d#clip() failed');
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
  },
  
  'test PNGStream': function(assert, beforeExit){
    var canvas = new Canvas(320, 320)
      , ctx = canvas.getContext('2d')
      , path = __dirname + '/images/pngstream.png'
      , called = 0;

    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.strokeRect(0,0,320,320);
    
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    var steps = 200;
    while (steps--) {
      ctx.fillRect(
          160 - (steps / 2)
        , 160 - (steps / 2)
        , steps
        , steps
        );
    }
    
    var out = fs.createWriteStream(path)
      , stream = canvas.createSyncPNGStream();

    out.on('close', function(){
      assertChecksumOf(
          canvas
        , path
        , '04f2e1b4338de2d7451194cba7d29970'
        , 'PNGStream failed');
    });

    stream.on('data', function(chunk){ out.write(chunk); });
    stream.on('end', function(){
      ++called;
      out.end();
    });

    beforeExit(function(){
      assert.equal(1, called);
    });
  }
}