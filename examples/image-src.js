const fs = require('fs')
const path = require('path')
const Canvas = require('..')

const Image = Canvas.Image
const canvas = Canvas.createCanvas(200, 200)
const ctx = canvas.getContext('2d')

ctx.fillRect(0, 0, 150, 150)
ctx.save()

ctx.fillStyle = '#09F'
ctx.fillRect(15, 15, 120, 120)

ctx.save()
ctx.fillStyle = '#FFF'
ctx.globalAlpha = 0.5
ctx.fillRect(30, 30, 90, 90)

ctx.restore()
ctx.fillRect(45, 45, 60, 60)

ctx.restore()
ctx.fillRect(60, 60, 30, 30)

const img = new Image()
img.onerror = err => { throw err }
img.onload = () => {
  img.src = canvas.toBuffer()
  ctx.drawImage(img, 0, 0, 50, 50)
  ctx.drawImage(img, 50, 0, 50, 50)
  ctx.drawImage(img, 100, 0, 50, 50)

  const img2 = new Image()
  img2.onload = () => {
    ctx.drawImage(img2, 30, 50, img2.width / 4, img2.height / 4)
    canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-src.png')))
  }
  img2.onerror = err => { throw err }
  img2.src = path.join(__dirname, 'images', 'squid.png')
}
