const fs = require('fs')
const Canvas = require('..')

const canvas = Canvas.createCanvas(500, 500, 'pdf')
const ctx = canvas.getContext('2d')

let x, y

function reset () {
  x = 50
  y = 80
}

function h1 (str) {
  ctx.font = '22px Helvetica'
  ctx.fillText(str, x, y)
}

function p (str) {
  ctx.font = '10px Arial'
  ctx.fillText(str, x, (y += 20))
}

reset()
h1('PDF demo')
p('Multi-page PDF demonstration')
ctx.addPage()

reset()
h1('Page #2')
p('This is the second page')
ctx.addPage(250, 250) // create a page with half the size of the canvas

reset()
h1('Page #3')
p('This is the third page')

fs.writeFile('out.pdf', canvas.toBuffer(), function (err) {
  if (err) throw err

  console.log('created out.pdf')
})
