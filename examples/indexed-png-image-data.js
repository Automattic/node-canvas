const Canvas = require('..')
const fs = require('fs')
const path = require('path')
const canvas = Canvas.createCanvas(200, 200)
const ctx = canvas.getContext('2d', { pixelFormat: 'A8' })

// Matches the "fillStyle" browser test, made by manipulating imageData
const palette = new Uint8ClampedArray(37 * 4)
let k = 0
let i, j
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
const idata = ctx.getImageData(0, 0, 200, 200)
for (i = 0; i < 6; i++) {
  for (j = 0; j < 6; j++) {
    const index = j * 6 + i
    // fill rect:
    for (let xr = j * 25; xr < j * 25 + 25; xr++) {
      for (let yr = i * 25; yr < i * 25 + 25; yr++) {
        idata.data[xr * 200 + yr] = index + 1
      }
    }
  }
}
ctx.putImageData(idata, 0, 0)

canvas.createPNGStream({ palette: palette })
  .pipe(fs.createWriteStream(path.join(__dirname, 'indexed.png')))
