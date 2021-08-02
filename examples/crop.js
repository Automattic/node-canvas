const fs = require('fs')
const path = require('path')
const Canvas = require('canvas')

const img = new Canvas.Image()

img.onerror = function (err) {
  throw err
}

img.onload = function () {
  const w = img.width / 2
  const h = img.height / 2
  const canvas = Canvas.createCanvas(w, h)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h)

  const out = fs.createWriteStream(path.join(__dirname, 'crop.jpg'))
  const stream = canvas.createJPEGStream({
    bufsize: 2048,
    quality: 80
  })

  stream.pipe(out)
}

img.src = path.join(__dirname, 'images', 'squid.png')
