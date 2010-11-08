
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , canvasFactory = require('./node-o3-canvas/lib/o3-canvas')
  , canvas = new Canvas(200, 200)
  , largeCanvas = new Canvas(1000, 1000)
  , ctx = canvas.getContext('2d')
  , o3ctx = canvasFactory(200,200,'argb')
  , o3ctxLarge = canvasFactory(1000,1000,'argb');

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

// bm('PNGStream 200x200', 50, function(done){
//   var stream = canvas.createSyncPNGStream();
//   stream.on('data', function(chunk){
//     // whatever
//   });
//   stream.on('end', function(){
//     done();
//   });
// });

// node-o3-canvas
console.log('\n  node-o3-canvas\n');

bm('o3 lineTo()', function(){
  o3ctx.lineTo(0, 50);
});

bm('o3 fillStyle= hex', function(){
  o3ctx.fillStyle = '#FFCCAA';
});

bm('o3 fillStyle= rgba()', function(){
  o3ctx.fillStyle = 'rgba(0,255,80,1)';
});

bm('o3 fillRect()', function(){
  o3ctx.fillRect(50, 50, 100, 100);
});

bm('o3 strokeRect()', function(){
  o3ctx.strokeRect(50, 50, 100, 100);
});

bm('pngBuffer() 200x200', 50, function(){
  o3ctx.pngBuffer();
});

bm('pngBuffer() 1000x1000', 50, function(){
  o3ctxLarge.pngBuffer();
});

bm('pngBuffer().toBase64() 200x200', 50, function(){
  o3ctx.pngBuffer().toBase64();
});

console.log();
