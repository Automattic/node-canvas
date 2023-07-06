const fs = require('fs')
const path = require('path')
const Canvas = require('..')

const canvas = Canvas.createCanvas(100, 100)
const ctx = canvas.getContext('2d')

ctx.fillStyle = '#f00'
ctx.rect(0, 0, 100, 50)
ctx.arc(50, 50, 50, 0, 2 * Math.PI)
ctx.fill('evenodd')

canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, '/fill-evenodd.jpg')))
