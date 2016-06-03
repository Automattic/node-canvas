var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var Image = Canvas.Image
var img = new Image()

img.onerror = function (err) {
  throw err
}

img.onload = function () {
  var w = img.width / 2
  var h = img.height / 2
  var canvas = new Canvas(w, h)
  var ctx = canvas.getContext('2d')

  ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h)

  var out = fs.createWriteStream(path.join(__dirname, 'crop.png'))
  var stream = canvas.createJPEGStream({
    bufsize: 2048,
    quality: 80
  })

  stream.pipe(out)
}

img.src = path.join(__dirname, 'images', 'squid.png')
