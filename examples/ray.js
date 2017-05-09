var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var canvas = new Canvas(243 * 4, 243)
var ctx = canvas.getContext('2d')

function render (level) {
  ctx.fillStyle = getPointColour(122, 122)
  ctx.fillRect(0, 0, 240, 240)
  renderLevel(level, 81, 0)
}

function renderLevel (minimumLevel, level, y) {
  var x

  for (x = 0; x < 243 / level; ++x) {
    drawBlock(x, y, level)
  }
  for (x = 0; x < 243 / level; x += 3) {
    drawBlock(x, y + 1, level)
    drawBlock(x + 2, y + 1, level)
  }
  for (x = 0; x < 243 / level; ++x) {
    drawBlock(x, y + 2, level)
  }
  if ((y += 3) >= 243 / level) {
    y = 0
    level /= 3
  }
  if (level >= minimumLevel) {
    renderLevel(minimumLevel, level, y)
  }
}

function drawBlock (x, y, level) {
  ctx.fillStyle = getPointColour(
    x * level + (level - 1) / 2,
    y * level + (level - 1) / 2
  )

  ctx.fillRect(
    x * level,
    y * level,
    level,
    level
  )
}

function getPointColour (x, y) {
  x = x / 121.5 - 1
  y = -y / 121.5 + 1

  var x2y2 = x * x + y * y
  if (x2y2 > 1) {
    return '#000'
  }

  var root = Math.sqrt(1 - x2y2)
  var x3d = x * 0.7071067812 + root / 2 - y / 2
  var y3d = x * 0.7071067812 - root / 2 + y / 2
  var z3d = 0.7071067812 * root + 0.7071067812 * y
  var brightness = -x / 2 + root * 0.7071067812 + y / 2
  if (brightness < 0) brightness = 0

  var r = Math.round(brightness * 127.5 * (1 - y3d))
  var g = Math.round(brightness * 127.5 * (x3d + 1))
  var b = Math.round(brightness * 127.5 * (z3d + 1))

  return 'rgb(' + r + ', ' + g + ', ' + b + ')'
}

var start = new Date()

render(10)
ctx.translate(243, 0)
render(6)
ctx.translate(243, 0)
render(3)
ctx.translate(243, 0)
render(1)

console.log('Rendered in %s seconds', (new Date() - start) / 1000)

canvas.pngStream().pipe(fs.createWriteStream(path.join(__dirname, 'ray.png')))
