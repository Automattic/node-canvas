var fs = require('fs')
var path = require('path')
var Canvas = require('..')

function fontFile (name) {
  return path.join(__dirname, '/pfennigFont/', name)
}

// Pass each font, including all of its individual variants if there are any, to
// `registerFont`. When you set `ctx.font`, refer to the styles and the family
// name as it is embedded in the TTF. If you aren't sure, open the font in
// FontForge and visit Element -> Font Information and copy the Family Name
Canvas.registerFont(fontFile('Pfennig.ttf'), {family: 'pfennigFont'})
Canvas.registerFont(fontFile('PfennigBold.ttf'), {family: 'pfennigFont', weight: 'bold'})
Canvas.registerFont(fontFile('PfennigItalic.ttf'), {family: 'pfennigFont', style: 'italic'})
Canvas.registerFont(fontFile('PfennigBoldItalic.ttf'), {family: 'pfennigFont', weight: 'bold', style: 'italic'})

var canvas = new Canvas(320, 320)
var ctx = canvas.getContext('2d')

ctx.font = 'normal normal 50px Helvetica'

ctx.fillText('Quo Vaids?', 0, 70)

ctx.font = 'bold 50px pfennigFont'
ctx.fillText('Quo Vaids?', 0, 140)

ctx.font = 'italic 50px pfennigFont'
ctx.fillText('Quo Vaids?', 0, 210)

ctx.font = 'bold italic 50px pfennigFont'
ctx.fillText('Quo Vaids?', 0, 280)

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'font.png')))
