var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var Image = Canvas.Image

var img = new Image()
var start = new Date()

img.onerror = function (err) {
  throw err
}

img.onload = function () {
  var width = 100
  var height = 100
  var canvas = new Canvas(width, height)
  var ctx = canvas.getContext('2d')
  var out = fs.createWriteStream(path.join(__dirname, 'resize.png'))

  ctx.imageSmoothingEnabled = true
  ctx.drawImage(img, 0, 0, width, height)

  canvas.pngStream().pipe(out)

  out.on('finish', function () {
    console.log('Resized and saved in %dms', new Date() - start)
  })
}

img.src = (process.argv[2] || path.join(__dirname, 'images', 'squid.png'))
