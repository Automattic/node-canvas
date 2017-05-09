var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var canvas = new Canvas(150, 150)
var ctx = canvas.getContext('2d')

ctx.fillStyle = '#FD0'
ctx.fillRect(0, 0, 75, 75)

ctx.fillStyle = '#6C0'
ctx.fillRect(75, 0, 75, 75)

ctx.fillStyle = '#09F)'
ctx.fillRect(0, 75, 75, 75)

ctx.fillStyle = '#F30'
ctx.fillRect(75, 75, 150, 150)

ctx.fillStyle = '#FFF'

// set transparency value
ctx.globalAlpha = 0.2

// Draw semi transparent circles
for (var i = 0; i < 7; i++) {
  ctx.beginPath()
  ctx.arc(75, 75, 10 + 10 * i, 0, Math.PI * 2, true)
  ctx.fill()
}

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'globalAlpha.png')))
