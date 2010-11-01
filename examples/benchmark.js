
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , canvas = new Canvas(200, 200)
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

bm('lineTo()', function(){
  ctx.lineTo(0, 50);
});

bm('fillStyle=', function(){
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

bm('toBuffer()', 250, function(){
  canvas.toBuffer();
});

bm('toDataURL()', 250, function(){
  canvas.toDataURL();
});

bm('PNGStream', 250, function(done){
  var stream = canvas.createSyncPNGStream();
  stream.on('data', function(chunk){
    // whatever
  });
  stream.on('end', function(){
    done();
  });
});
