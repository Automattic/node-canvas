
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , fs = require('fs');

var img = new Image;

img.onerror = function(err){
  throw err;
};

img.onload = function(){
  var w = img.width / 2
    , h = img.height / 2
    , canvas = new Canvas(w, h)
    , ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h);

  var out = fs.createWriteStream(__dirname + '/crop.jpg');

  var stream = canvas.createJPEGStream({
    bufsize : 2048,
    quality : 80
  });

  stream.pipe(out);
};

img.src = __dirname + '/images/squid.png';


