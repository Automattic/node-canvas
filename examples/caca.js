var Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(480, 408)
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

var cat = fs.readFileSync(__dirname + '/images/lime-cat.jpg');
img = new Image;
img.src = cat;
ctx.drawImage(img, 0, 0);

if (process.stdout.isTTY) {
  var cols = process.stdout.columns;
  var rows = process.stdout.rows;
} else {
  var cols = 80;
  var rows = 24;
}

var fontWidth = 10;
var fontHeight = 20;

var options = {fontWidth: fontWidth, fontHeight: fontHeight};

var terminalAspectRatio = (cols * fontWidth) / (rows * fontHeight);
if (canvas.width / canvas.height > terminalAspectRatio) {
  options.cols = cols;
} else {
  options.rows = rows;
}
process.stdout.write(canvas.toAnsiString(options));

