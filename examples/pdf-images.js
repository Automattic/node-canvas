var fs = require('fs')
var Canvas = require('..')

var Image = Canvas.Image
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

function img (src) {
  var img = new Image()
  img.src = src
  ctx.drawImage(img, x, (y += 20))
  y += img.height
}

reset()
h1('PDF image demo')
p('This is an image embedded in a PDF')
img('examples/images/squid.png')
p('Figure 1.0 - Some squid thing')
ctx.addPage()

reset()
h1('Lime cat')
p('This is a pretty sweet cat')
img('examples/images/lime-cat.jpg')
p('Figure 1.1 - Lime cat is awesome')
ctx.addPage()

fs.writeFile('out.pdf', canvas.toBuffer(), function (err) {
  if (err) throw err

  console.log('created out.pdf')
})
