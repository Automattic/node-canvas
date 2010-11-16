
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(400, 267)
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

var img = new Image;

img.onload = function(){
  ctx.drawImage(img,0,0);
};

img.src = __dirname + '/squid.png';

var out = fs.createWriteStream(__dirname + '/kraken.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});