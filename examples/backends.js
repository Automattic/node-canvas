const fs = require('fs')
const { resolve } = require('path')

const Canvas = require('..')

const imagebackend = new Canvas.backends.ImageBackend(800, 600)

const canvas = new Canvas.Canvas(imagebackend)
const ctx = canvas.getContext('2d')

console.log('Width: ' + canvas.width + ', Height: ' + canvas.height)

ctx.fillStyle = '#00FF00'
ctx.fillRect(50, 50, 100, 100)

const outPath = resolve(__dirname, 'rectangle.png')

canvas.createPNGStream().pipe(fs.createWriteStream(outPath))
