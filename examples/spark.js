
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , canvas = new Canvas(40, 15)
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

Object.defineProperty(Array.prototype, 'max', {
  get: function(){
    var max = 0;
    for (var i = 0, len = this.length; i < len; ++i) {
      var n = this[i];
      if (n > max) max = n;
    }
    return max;
  }
});

function spark(ctx, data) {
  var len = data.length
    , pad = 1
    , width = ctx.canvas.width
    , height = ctx.canvas.height
    , barWidth = width / len
    , max = data.max;
  ctx.fillStyle = 'rgba(0,0,255,0.5)';
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  data.forEach(function(n, i){
    var x = i * barWidth + pad
      , y = height * (n / max)
    ctx.lineTo(x, height - y);
    ctx.fillRect(x, height, barWidth - pad, -y);
  });
  ctx.stroke();
}

spark(ctx, [1,2,4,5,10,4,2,5,4,3,3,2]);

canvas.toBuffer(function(err, buf){
  if (err) throw err;
  fs.writeFile(__dirname + '/spark.png', buf);
});
