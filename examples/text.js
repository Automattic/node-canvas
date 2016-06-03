var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var canvas = new Canvas(200, 200)
var ctx = canvas.getContext('2d')

ctx.globalAlpha = 0.2

ctx.strokeRect(0, 0, 200, 200)
ctx.lineTo(0, 100)
ctx.lineTo(200, 100)
ctx.stroke()

ctx.beginPath()
ctx.lineTo(100, 0)
ctx.lineTo(100, 200)
ctx.stroke()

ctx.globalAlpha = 1
ctx.font = 'normal 40px Impact, serif'

ctx.rotate(0.5)
ctx.translate(20, -40)

ctx.lineWidth = 1
ctx.strokeStyle = '#ddd'
ctx.strokeText('Wahoo', 50, 100)

ctx.fillStyle = '#000'
ctx.fillText('Wahoo', 49, 99)

var m = ctx.measureText('Wahoo')

ctx.strokeStyle = '#f00'

ctx.strokeRect(
  49 + m.actualBoundingBoxLeft,
  99 - m.actualBoundingBoxAscent,
  m.actualBoundingBoxRight - m.actualBoundingBoxLeft,
  m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
)

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'text.png')))
