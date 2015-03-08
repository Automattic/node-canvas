
/**
* Module dependencies.
*/

var fs = require('fs');
var Canvas = require('../lib/canvas');

var canvas = new Canvas(320, 320, "fbdev")
var ctx = canvas.getContext('2d')

console.log("Width: " + canvas.width + ", Height: " + canvas.height);

ctx.fillStyle = "#00FF00";
ctx.fillRect(50, 50, 100, 100);

var out = fs.createWriteStream(__dirname + '/rectangle.png');
var stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});
