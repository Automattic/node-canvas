var fs = require('fs')
var resolve = require('path').resolve

var Canvas = require('..')

var imagebackend = new Canvas.backends.ImageBackend(800, 600)

var canvas = new Canvas.Canvas(imagebackend)
var ctx = canvas.getContext('2d')

console.log('Width: ' + canvas.width + ', Height: ' + canvas.height)

ctx.fillStyle = '#00FF00'
ctx.fillRect(50, 50, 100, 100)

var outPath = resolve(__dirname, 'rectangle.png')

canvas.createPNGStream().pipe(fs.createWriteStream(outPath))
