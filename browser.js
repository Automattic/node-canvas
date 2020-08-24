/* globals document, ImageData */



const parseFont = require('./lib/parse-font');

exports.parseFont = parseFont;

exports.createCanvas = function (width, height) {
  return Object.assign(document.createElement('canvas'), { width: width, height: height });
}

exports.createImageData = function (array, width, height) {
  // Browser implementation of ImageData looks at the number of arguments passed
  switch (arguments.length) {
    case 0: return new ImageData()
    case 1: return new ImageData(array);
    case 2: return new ImageData(array, width);
    default: return new ImageData(array, width, height);
  }
}

exports.loadImage = function (src, options) {
  return new Promise(function (resolve, reject) {
    const image = Object.assign(document.createElement('img'), options);

    function cleanup () {
      image.onload = null;
      image.onerror = null;
    }

    image.onload = function () { cleanup(); resolve(image); }
    image.onerror = function () { cleanup(); reject(new Error('Failed to load the image "' + src + '"')); }

    image.src = src;
  })
}

exports.Context2d = exports.CanvasRenderingContext2D = CanvasRenderingContext2D;

exports.CanvasGradient = CanvasGradient;
exports.CanvasPattern = CanvasPattern;

exports.Image = Image;
exports.ImageData = ImageData;
    
exports.DOMMatrix = DOMMatrix;
exports.DOMPoint = DOMPoint;
