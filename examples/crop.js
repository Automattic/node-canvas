
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , fs = require('fs');

var img = new Image
  , start = new Date;

img.onerror = function(err){
  throw err;
};

img.onload = function(){
  var w = img.width / 2
    , h = img.height / 2
    , canvas = new Canvas(w, h)
    , ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h);

  var out = fs.createWriteStream(__dirname + '/crop.jpg')
    , stream = canvas.createJPEGStream({
        bufsize : 2048,
        quality : 80
      });

  stream.on('data', function(chunk, len){
    out.write(chunk);
  });

  stream.on('end', function(){
    console.log('Cropped and saved in %dms', new Date - start);
  });
};

img.src = __dirname + '/images/squid.png';


