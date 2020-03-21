const fs = require('fs')
const path = require('path')
const Canvas = require('..')

const Image = Canvas.Image
const canvas = Canvas.createCanvas(288, 288)
const ctx = canvas.getContext('2d')

const img = new Image()
img.onload = () => {
  ctx.drawImage(img, 0, 0)
  canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, 'passedThroughGrayscale.jpg')))
}
img.onerror = err => {
  throw err
}

img.src = path.join(__dirname, 'images', 'grayscaleImage.jpg')
