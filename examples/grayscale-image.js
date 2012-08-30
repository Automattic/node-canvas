/**
 * Passing grayscale image through canvas.  Image should remain a gray square.
 * If image is distorted with lines, then grayscale images are being distorted.
 */
var Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(288, 288)
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

var grayScaleImage = fs.readFileSync(__dirname + '/images/grayscaleImage.jpg');
img = new Image;
img.src = grayScaleImage;

ctx.drawImage(img, 0, 0);

var out = fs.createWriteStream(__dirname + '/passedThroughGrayscale.jpg')
  , stream = canvas.createJPEGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});