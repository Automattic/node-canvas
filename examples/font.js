const fs = require('fs')
const path = require('path')
const {createCanvas, FontFace, fonts} = require('..')

function fontFile (name) {
  return path.join(__dirname, '/pfennigFont/', name)
}

// Pass each font, including all of its individual variants if there are any, to
// `registerFont`. When you set `ctx.font`, refer to the styles and the family
// name as it is embedded in the TTF. If you aren't sure, open the font in
// FontForge and visit Element -> Font Information and copy the Family Name
fonts.add(new FontFace('pfennigFont', fontFile('Pfennig.ttf')));
fonts.add(new FontFace('pfennigFont', fontFile('PfennigBold.ttf'), { weight: 'bold' }))
fonts.add(new FontFace('pfennigFont', fontFile('PfennigItalic.ttf'), { style: 'italic' }))
fonts.add(new FontFace('pfennigFont', fontFile('PfennigBoldItalic.ttf'), { weight: 'bold', style: 'italic' }))

const canvas = createCanvas(320, 320)
const ctx = canvas.getContext('2d')

ctx.font = 'normal normal 50px Helvetica'

ctx.fillText('Quo Vaids?', 0, 70)

ctx.font = 'bold 50px pfennigFont'
ctx.fillText('Quo Vaids?', 0, 140, 100)

ctx.font = 'italic 50px pfennigFont'
ctx.fillText('Quo Vaids?', 0, 210)

ctx.font = 'bold italic 50px pfennigFont'
ctx.fillText('Quo Vaids?', 0, 280)

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'font.png')))
