
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , fs = require('fs')
  , path = require("path");

function fontFile(name) {
  return path.join(__dirname, '/pfennigFont/', name);
}

Canvas.registerFont(fontFile('Pfennig.ttf'));
Canvas.registerFont(fontFile('PfennigBold.ttf'));
Canvas.registerFont(fontFile('PfennigItalic.ttf'));
Canvas.registerFont(fontFile('PfennigBoldItalic.ttf'));

var canvas = new Canvas(320, 320);
var ctx = canvas.getContext('2d');

ctx.font = 'normal normal 50px Helvetica';

ctx.fillText('Quo Vaids?', 0, 70);

ctx.font = 'bold 50px Pfennig';
ctx.fillText('Quo Vaids?', 0, 140);

ctx.font = 'italic 50px Pfennig';
ctx.fillText('Quo Vaids?', 0, 210);

ctx.font = 'bold italic 50px Pfennig';
ctx.fillText('Quo Vaids?', 0, 280);

var out = fs.createWriteStream(__dirname + '/font.png');
var stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});
