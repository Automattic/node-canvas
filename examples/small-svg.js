
var Canvas = require('../')
  , canvas = new Canvas(400, 200, 'svg')
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

var y = 80
  , x = 50;

ctx.font = '22px Helvetica';
ctx.fillText('node-canvas SVG', x, y);

ctx.font = '10px Arial';
ctx.fillText('Just a quick example of SVGs with node-canvas', x, y += 20);

ctx.globalAlpha = .5;
ctx.fillRect(x, y += 20, 10, 10);
ctx.fillRect(x += 20, y, 10, 10);
ctx.fillRect(x += 20, y, 10, 10);

fs.writeFile('out.svg', canvas.toBuffer());
console.log('created out.svg');
