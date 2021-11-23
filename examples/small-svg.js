const fs = require('fs')
const Canvas = require('..')

const canvas = Canvas.createCanvas(400, 200, 'svg')
const ctx = canvas.getContext('2d')

let y = 80
let x = 50

ctx.font = '22px Helvetica'
ctx.fillText('node-canvas SVG', x, y)

ctx.font = '10px Arial'
ctx.fillText('Just a quick example of SVGs with node-canvas', x, (y += 20))

ctx.globalAlpha = 0.5
ctx.fillRect(x, (y += 20), 10, 10)
ctx.fillRect((x += 20), y, 10, 10)
ctx.fillRect((x += 20), y, 10, 10)

fs.writeFile('out.svg', canvas.toBuffer(), function (err) {
  if (err) throw err

  console.log('created out.svg')
})
