
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , canvas = new Canvas(320, 320)
  , Font = Canvas.Font
  , ctx = canvas.getContext('2d')
  , fs = require('fs')
  , path = require("path");

if (!Font) {
	throw new Error('Need to compile with font support');
}

function fontFile(name) {
  return path.join(__dirname, '/pfennigFont/', name);
}

var pfennigFont = new Font('pfennigFont', fontFile('Pfennig.ttf'));
pfennigFont.addFace(fontFile('PfennigBold.ttf'),   'bold');
pfennigFont.addFace(fontFile('PfennigItalic.ttf'), 'normal', 'italic');
pfennigFont.addFace(fontFile('PfennigBoldItalic.ttf'), 'bold', 'italic');

var canvas = new Canvas(320, 320)
var ctx = canvas.getContext('2d')

// Tell the ctx to use the font.
ctx.addFont(pfennigFont);

ctx.font = 'normal normal 50px Helvetica';

ctx.fillText('Quo Vaids?', 0, 70);

ctx.font = 'bold 50px pfennigFont';
ctx.fillText('Quo Vaids?', 0, 140);

ctx.font = 'italic 50px pfennigFont';
ctx.fillText('Quo Vaids?', 0, 210);

ctx.font = 'bold italic 50px pfennigFont';
ctx.fillText('Quo Vaids?', 0, 280);

var out = fs.createWriteStream(__dirname + '/font.png');
var stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});
