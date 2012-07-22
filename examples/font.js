
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , canvas = new Canvas(320, 320)
  , TrueTypeFont = Canvas.TrueTypeFont
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

var pfennigFont = new TrueTypeFont('pfennigFont', 'pfennigFont/Pfennig.ttf');
pfennigFont.addFace('pfennigFont/PfennigBold.ttf',   'bold');
pfennigFont.addFace('pfennigFont/PfennigItalic.ttf', 'normal', 'italic');
pfennigFont.addFace('pfennigFont/PfennigBoldItalic.ttf', 'bold', 'italic');

// Tell the ctx to use the font.
ctx.useFont(pfennigFont);

ctx.font = '50px pfennigFont';
ctx.fillText('Quo Vaids?', 0, 70);

ctx.font = 'bold 50px pfennigFont';
ctx.fillText('Quo Vaids?', 0, 140);

ctx.font = 'italic 50px pfennigFont';
ctx.fillText('Quo Vaids?', 0, 210);

ctx.font = 'bold italic 50px pfennigFont';
ctx.fillText('Quo Vaids?', 0, 280);

var out = fs.createWriteStream(__dirname + '/font.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});
