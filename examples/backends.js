var Canvas = require('..')
  , fs = require('fs');

var imagebackend = new Canvas.Backends.ImageBackend(800, 600);

var canvas = new Canvas(imagebackend);
var ctx = canvas.getContext('2d');

console.log("Width: " + canvas.width + ", Height: " + canvas.height);

ctx.fillStyle = "#00FF00";
ctx.fillRect(50, 50, 100, 100);

var outPath = __dirname + '/rectangle.png';

canvas.createPNGStream().pipe(fs.createWriteStream(outPath));
