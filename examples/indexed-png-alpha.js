const Canvas = require('..')
const fs = require('fs')
const path = require('path')
const canvas = Canvas.createCanvas(200, 200)
const ctx = canvas.getContext('2d', { pixelFormat: 'A8' })

// Matches the "fillStyle" browser test, made by using alpha fillStyle value
const palette = new Uint8ClampedArray(37 * 4)
let i, j
let k = 0
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
for (i = 0; i < 6; i++) {
  for (j = 0; j < 6; j++) {
    const index = i * 6 + j + 1.5 // 0.5 to bias rounding
    const fraction = index / 255
    ctx.fillStyle = 'rgba(0,0,0,' + fraction + ')'
    ctx.fillRect(j * 25, i * 25, 25, 25)
  }
}

canvas.createPNGStream({ palette: palette })
  .pipe(fs.createWriteStream(path.join(__dirname, 'indexed2.png')))
