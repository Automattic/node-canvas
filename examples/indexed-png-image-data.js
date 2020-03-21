var Canvas = require('..')
var fs = require('fs')
var path = require('path')
var canvas = Canvas.createCanvas(200, 200)
var ctx = canvas.getContext('2d', { pixelFormat: 'A8' })

// Matches the "fillStyle" browser test, made by manipulating imageData
var palette = new Uint8ClampedArray(37 * 4)
var k = 0
var i, j
// First value is opaque white:
palette[k++] = 255
palette[k++] = 255
palette[k++] = 255
palette[k++] = 255
for (i = 0; i < 6; i++) {
  for (j = 0; j < 6; j++) {
    palette[k++] = Math.floor(255 - 42.5 * i)
    palette[k++] = Math.floor(255 - 42.5 * j)
    palette[k++] = 0
    palette[k++] = 255
  }
}
var idata = ctx.getImageData(0, 0, 200, 200)
for (i = 0; i < 6; i++) {
  for (j = 0; j < 6; j++) {
    var index = j * 6 + i
    // fill rect:
    for (var xr = j * 25; xr < j * 25 + 25; xr++) {
      for (var yr = i * 25; yr < i * 25 + 25; yr++) {
        idata.data[xr * 200 + yr] = index + 1
      }
    }
  }
}
ctx.putImageData(idata, 0, 0)

canvas.createPNGStream({ palette: palette })
  .pipe(fs.createWriteStream(path.join(__dirname, 'indexed.png')))
