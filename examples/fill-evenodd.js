
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas');
var fs = require('fs');

var canvas = new Canvas(100, 100);
var ctx = canvas.getContext('2d');

ctx.fillStyle = '#f00';
ctx.rect(0, 0, 100, 50);
ctx.arc(50, 50, 50, 0, 2 * Math.PI);
ctx.fill('evenodd');
//ctx.fill();

var out = fs.createWriteStream(__dirname + '/fill-evenodd.jpg');

var stream = canvas.createJPEGStream({
  bufsize : 2048,
  quality : 80
});

stream.pipe(out);
