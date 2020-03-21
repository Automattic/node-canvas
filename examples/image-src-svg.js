var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var canvas = Canvas.createCanvas(500, 500)
var ctx = canvas.getContext('2d')
ctx.fillStyle = 'white'
ctx.fillRect(0, 0, 500, 500)

Canvas.loadImage(path.join(__dirname, 'images', 'small-svg.svg'))
  .then(image => {
    image.width *= 1.5
    image.height *= 1.5
    ctx.drawImage(image, canvas.width / 2 - image.width / 2, canvas.height / 2 - image.height / 2)

    canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-src-svg.png')))
  })
  .catch(e => console.error(e))
