var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var canvas = new Canvas(400, 100)
var ctx = canvas.getContext('2d')

ctx.globalAlpha = 1
ctx.font = 'normal 16px Impact'

ctx.textBaseline = 'top'

// Note this demo depends node-canvas being installed with pango support,
// and your system having installed fonts supporting the glyphs.

ctx.fillStyle = '#000'
ctx.fillText('English: Some text in Impact.', 10, 10)
ctx.fillText('Japanese: 図書館の中では、静かにする。', 10, 30)
ctx.fillText('Arabic: اللغة العربية هي أكثر اللغات تحدثا ضمن', 10, 50)
ctx.fillText('Korean: 모타는사라미 못하는 사람이', 10, 70)

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'pango-glyphs.png')))
