const fs = require('fs')
const path = require('path')
const Canvas = require('..')

const Image = Canvas.Image
const canvas = Canvas.createCanvas(200, 300)
const ctx = canvas.getContext('2d')

const img = new Image()
img.onload = () => {
  ctx.drawImage(img, 0, 0)
  canvas.createPNGStream()
    .pipe(fs.createWriteStream(path.join(__dirname, 'image-src-url.png')))
}
img.onerror = err => {
  console.log(err)
}
img.src = 'http://picsum.photos/200/300'
