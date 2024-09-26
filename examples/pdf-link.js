const fs = require('fs')
const Canvas = require('..')

const canvas = Canvas.createCanvas(400, 200, 'pdf')
const ctx = canvas.getContext('2d')

let y = 80
let x = 50

ctx.beginTag({ name: 'Link', uri: 'https://google.com' })
ctx.font = '22px Helvetica'
ctx.fillText('node-canvas pdf', x, y)
ctx.closeTag()

fs.writeFile('out.pdf', canvas.toBuffer(), function (err) {
  if (err) throw err

  console.log('created out.pdf')
})
