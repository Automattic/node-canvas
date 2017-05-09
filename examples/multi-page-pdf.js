var fs = require('fs')
var Canvas = require('..')

var canvas = new Canvas(500, 500, 'pdf')
var ctx = canvas.getContext('2d')

var x, y

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
ctx.addPage()

reset()
h1('Page #3')
p('This is the third page')

fs.writeFile('out.pdf', canvas.toBuffer(), function (err) {
  if (err) throw err

  console.log('created out.pdf')
})
