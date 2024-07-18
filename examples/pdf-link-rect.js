const fs = require('fs')
const Canvas = require('..')

const canvas = Canvas.createCanvas(400, 200, 'pdf')
const ctx = canvas.getContext('2d')

let x = 50
let y = 80

ctx.beginTag({ name: 'Link', uri: 'https://google.com', rect: { x: 40, y: 70, width: 100, height: 50 } })
ctx.closeTag()

ctx.font = '22px Helvetica'
ctx.fillText('node-canvas pdf', x, y)

fs.writeFile('out.pdf', canvas.toBuffer(), function (err) {
  if (err) throw err

  console.log('created out.pdf')
})
