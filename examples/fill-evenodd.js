var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var canvas = new Canvas(100, 100)
var ctx = canvas.getContext('2d')

ctx.fillStyle = '#f00'
ctx.rect(0, 0, 100, 50)
ctx.arc(50, 50, 50, 0, 2 * Math.PI)
ctx.fill('evenodd')

canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, '/fill-evenodd.jpg')))
