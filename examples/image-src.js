var fs = require('fs')
var path = require(path)
var Canvas = require('..')

var Image = Canvas.Image
var canvas = new Canvas(200, 200)
var ctx = canvas.getContext('2d')

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

var img = new Image()
img.src = canvas.toBuffer()
ctx.drawImage(img, 0, 0, 50, 50)
ctx.drawImage(img, 50, 0, 50, 50)
ctx.drawImage(img, 100, 0, 50, 50)

img = new Image()
img.src = fs.readFileSync(path.join(__dirname, 'images', 'squid.png'))
ctx.drawImage(img, 30, 50, img.width / 4, img.height / 4)

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-src.png')))
