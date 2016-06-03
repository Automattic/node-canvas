var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var Image = Canvas.Image
var canvas = new Canvas(288, 288)
var ctx = canvas.getContext('2d')

var img = new Image()
img.src = fs.readFileSync(path.join(__dirname, 'images', 'grayscaleImage.jpg'))

ctx.drawImage(img, 0, 0)

canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, 'passedThroughGrayscale.jpg')))
