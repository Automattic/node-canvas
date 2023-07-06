const fs = require('fs')
const path = require('path')
const Canvas = require('..')

const Image = Canvas.Image

const img = new Image()
const start = new Date()

img.onerror = function (err) {
  throw err
}

img.onload = function () {
  const width = 100
  const height = 100
  const canvas = Canvas.createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const out = fs.createWriteStream(path.join(__dirname, 'resize.png'))

  ctx.imageSmoothingEnabled = true
  ctx.drawImage(img, 0, 0, width, height)

  canvas.createPNGStream().pipe(out)

  out.on('finish', function () {
    console.log('Resized and saved in %dms', new Date() - start)
  })
}

img.src = (process.argv[2] || path.join(__dirname, 'images', 'squid.png'))
