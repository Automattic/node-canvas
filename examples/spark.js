
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , canvas = new Canvas(40, 15)
  , ctx = canvas.getContext('2d');

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

function spark(ctx, color, data) {
  var len = data.length
    , pad = 1
    , width = ctx.canvas.width
    , height = ctx.canvas.height
    , barWidth = width / len
    , max = data.max;
  ctx.fillStyle = color;
  data.forEach(function(n, i){
    ctx.fillRect(
        i * barWidth + pad
      , height
      , barWidth - pad
      , -(height * (n / max)));
  });
}

spark(ctx, 'blue', [1,2,4,5,10,4,2,5,4,3,3,2]);

canvas.savePNG(__dirname + "/spark.png");