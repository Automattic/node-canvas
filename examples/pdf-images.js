const fs = require('fs')
const { Image, createCanvas } = require('..')

const canvas = createCanvas(500, 500, 'pdf')
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

function img (src) {
  const img = new Image()
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

const buff = canvas.toBuffer('application/pdf', {
  title: 'Squid and Cat!',
  author: 'Octocat',
  subject: 'An example PDF made with node-canvas',
  keywords: 'node.js squid cat lime',
  creator: 'my app',
  modDate: new Date()
})

fs.writeFile('out.pdf', buff, function (err) {
  if (err) throw err

  console.log('created out.pdf')
})
