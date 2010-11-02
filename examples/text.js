
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , canvas = new Canvas(200, 200)
  , ctx = canvas.getContext('2d');

ctx.globalAlpha = .2;

ctx.strokeRect(0,0,200,200);
ctx.lineTo(0,100);
ctx.lineTo(200,100);
ctx.stroke();

ctx.beginPath();
ctx.lineTo(100,0);
ctx.lineTo(100,200);
ctx.stroke();

ctx.globalAlpha = 1;
ctx.font = 'normal 40px Impact, serif';

ctx.rotate(.5);
ctx.translate(20,-40);

ctx.lineWidth = 1;
ctx.strokeStyle = '#ddd';
ctx.strokeText("Wahoo", 50, 100);

ctx.fillStyle = '#000';
ctx.fillText("Wahoo", 49, 99);

var te = ctx.measureText('Wahoo');
ctx.strokeStyle = 'red';
ctx.strokeRect(50, 100 - te.height, te.width, te.height);

canvas.savePNG(__dirname + '/text.png');