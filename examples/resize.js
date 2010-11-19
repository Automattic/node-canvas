
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
  var width = img.width / 2
    , height = img.height / 2
    , canvas = new Canvas(width, height)
    , ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  canvas.toBuffer(function(err, buf){
    fs.writeFile(__dirname + '/resize.png', buf, function(){
      console.log('Resized and saved in %dms', new Date - start);
    });
  });
};

img.src = __dirname + '/images/squid.png';

