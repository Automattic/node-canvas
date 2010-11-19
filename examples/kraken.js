
/**
 * Module dependencies.
 */

var Canvas = require('../lib/canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(400, 267)
  , ctx = canvas.getContext('2d')
  , fs = require('fs');

var img = new Image;

img.onload = function(){
  ctx.drawImage(img,0,0);
};

img.src = __dirname + '/images/squid.png';


var sigma = 10; // radius
var kernel, kernelSize, kernelSum;
buildKernel();

function buildKernel() {
 var ss = sigma * sigma;
 var factor = 2 * Math.PI * ss;
 kernel = [];
 kernel.push([]);
 var i = 0, j;
 do {
     var g = Math.exp(-(i * i) / (2 * ss)) / factor;
     if (g < 1e-3) break;
     kernel[0].push(g);
     ++i;
 } while (i < 7);
 kernelSize = i;
 for (j = 1; j < kernelSize; ++j) {
     kernel.push([]);
     for (i = 0; i < kernelSize; ++i) {
         var g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
         kernel[j].push(g);
     }
 }
 kernelSum = 0;
 for (j = 1 - kernelSize; j < kernelSize; ++j) {
     for (i = 1 - kernelSize; i < kernelSize; ++i) {
         kernelSum += kernel[Math.abs(j)][Math.abs(i)];
     }
 }
}

function blurTest() {
 console.log('... running');

 var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
 var width = imgData.width, height = imgData.height;
 var data = imgData.data;

 var len = data.length;
 var startTime = (new Date()).getTime();

 for (var y = 0; y < height; ++y) {
   for (var x = 0; x < width; ++x) {
     var r = 0, g = 0, b = 0, a = 0;
     for (j = 1 - kernelSize; j < kernelSize; ++j) {
       if (y + j < 0 || y + j >= height) continue;
       for (i = 1 - kernelSize; i < kernelSize; ++i) {
         if (x + i < 0 || x + i >= width) continue;
         r += data[4 * ((y + j) * width + (x + i)) + 0] * kernel[Math.abs(j)][Math.abs(i)];
         g += data[4 * ((y + j) * width + (x + i)) + 1] * kernel[Math.abs(j)][Math.abs(i)];
         b += data[4 * ((y + j) * width + (x + i)) + 2] * kernel[Math.abs(j)][Math.abs(i)];
         a += data[4 * ((y + j) * width + (x + i)) + 3] * kernel[Math.abs(j)][Math.abs(i)];
       }
     }
     data[4 * (y * width + x) + 0] = r / kernelSum;
     data[4 * (y * width + x) + 1] = g / kernelSum;
     data[4 * (y * width + x) + 2] = b / kernelSum;
     data[4 * (y * width + x) + 3] = a / kernelSum;
   }
 }
 var finishTime = Date.now() - startTime;
 for (var i = 0; i < data.length; i++) {
     imgData.data[i] = data[i];
 }
 //imgData.data = data;
 ctx.putImageData(imgData, 0, 0);
 console.log('... finished in %dms', finishTime);
}
 
blurTest();

var out = fs.createWriteStream(__dirname + '/kraken.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});