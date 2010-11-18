
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , canvas = new Canvas(200, 200)
  , largeCanvas = new Canvas(1000, 1000)
  , ctx = canvas.getContext('2d');

var times = 10000;
console.log('\n  \x1b[33m%s\x1b[0m times\n', times);

function bm(label, overrideTimes, fn) {
  var start = new Date
    , n = times;

  if ('function' == typeof overrideTimes) {
    fn = overrideTimes;
  } else {
    n = overrideTimes;
    label += ' (' + n + ' times)';
  }

  var pending = n;

  function done(){
    var duration = (new Date - start) / 1000;
    console.log('  - \x1b[33m%s\x1b[0m %ss', label, duration);
  }

  if (fn.length) {
    while (n--) fn(function(){
      --pending || done();
    });
  } else {
    while (n--) fn();
    done();
  }
}

// node-canvas

bm('lineTo()', function(){
  ctx.lineTo(0, 50);
});

bm('arc()', function(){
  ctx.arc(75,75,50,0,Math.PI*2,true);
});

bm('fillStyle= hex', function(){
  ctx.fillStyle = '#FFCCAA';
});

bm('fillStyle= rgba()', function(){
  ctx.fillStyle = 'rgba(0,255,80,1)';
});

bm('fillRect()', function(){
  ctx.fillRect(50, 50, 100, 100);
});

bm('strokeRect()', function(){
  ctx.strokeRect(50, 50, 100, 100);
});

bm('linear gradients', function(){
  var lingrad = ctx.createLinearGradient(0,50,0,95);
  lingrad.addColorStop(0.5, '#000');
  lingrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = lingrad;
  ctx.fillRect(10,10,130,130);
});

bm('toBuffer() 200x200', 50, function(){
  canvas.toBuffer();
});

bm('toBuffer() 1000x1000', 50, function(){
  largeCanvas.toBuffer();
});

bm('toBuffer().toString("base64") 200x200', 50, function(){
  canvas.toBuffer().toString('base64');
});

bm('toDataURL() 200x200', 50, function(){
  canvas.toDataURL();
});

bm('moveTo() / arc() / stroke()', function(){
  ctx.beginPath();
  ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
  ctx.moveTo(110,75);
  ctx.arc(75,75,35,0,Math.PI,false);   // Mouth
  ctx.moveTo(65,65);
  ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
  ctx.moveTo(95,65);
  ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
  ctx.stroke();
});

bm('createImageData(300,300)', function(){
  ctx.createImageData(300,300);
});

bm('getImageData(0,0,100,100)', function(){
  ctx.getImageData(0,0,100,100);
});

// bm('PNGStream 200x200', 50, function(done){
//   var stream = canvas.createSyncPNGStream();
//   stream.on('data', function(chunk){
//     // whatever
//   });
//   stream.on('end', function(){
//     done();
//   });
// });

console.log();
