const fs = require('fs')
const path = require('path')
const Canvas = require('..')

const canvas = Canvas.createCanvas(400, 300, 'pdf')
const ctx = canvas.getContext('2d')

ctx.beginTag('Link', 'uri=\'https://google.com\'')
ctx.font = '22px Helvetica'
ctx.fillText('Text link to Google', 110, 50)
ctx.endTag('Link')

ctx.fillText('Rect link to node-canvas below!', 40, 180)

ctx.beginTag('Link', 'uri=\'https://github.com/Automattic/node-canvas\' rect=[0 200 400 100]')
ctx.endTag('Link')

fs.writeFile(path.join(__dirname, 'pdf-link.pdf'), canvas.toBuffer(), function (err) {
  if (err) throw err
})
