var Image
var imageSrc
var tests = {}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = tests
  Image = require('../../').Image
  imageSrc = function (filename) { return require('path').join(__dirname, '..', 'fixtures', filename) }
} else {
  window.tests = tests
  Image = window.Image
  imageSrc = function (filename) { return filename }
}

tests['clearRect()'] = function (ctx) {
  ctx.fillRect(25, 25, 100, 100)
  ctx.clearRect(45, 45, 60, 60)
  ctx.fillRect(50, 50, 50, 50)
}

tests['strokeRect()'] = function (ctx) {
  ctx.fillRect(25, 25, 100, 100)
  ctx.clearRect(45, 45, 60, 60)
  ctx.strokeRect(50, 50, 50, 50)
}

tests['fillRect()'] = function (ctx) {
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
    return (
      'rgb(' + Math.round(brightness * 127.5 * (1 - y3d)) +
      ',' + Math.round(brightness * 127.5 * (x3d + 1)) +
      ',' + Math.round(brightness * 127.5 * (z3d + 1)) +
      ')'
    )
  }

  render(1)
}

tests['lineTo()'] = function (ctx) {
  // Filled triangle
  ctx.beginPath()
  ctx.moveTo(25.5, 25)
  ctx.lineTo(105, 25)
  ctx.lineTo(25, 105)
  ctx.fill()

  // Stroked triangle
  ctx.beginPath()
  ctx.moveTo(125, 125)
  ctx.lineTo(125, 45)
  ctx.lineTo(45, 125)
  ctx.closePath()
  ctx.stroke()
}

tests['arc()'] = function (ctx) {
  ctx.beginPath()
  ctx.arc(75, 75, 50, 0, Math.PI * 2, true) // Outer circle
  ctx.moveTo(110, 75)
  ctx.arc(75, 75, 35, 0, Math.PI, false) // Mouth
  ctx.moveTo(65, 65)
  ctx.arc(60, 65, 5, 0, Math.PI * 2, true) // Left eye
  ctx.moveTo(95, 65)
  ctx.arc(90, 65, 5, 0, Math.PI * 2, true) // Right eye
  ctx.stroke()
}

tests['arc() 2'] = function (ctx) {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 3; j++) {
      ctx.beginPath()
      var x = 25 + j * 50 // x coordinate
      var y = 25 + i * 50 // y coordinate
      var radius = 20 // Arc radius
      var startAngle = 0 // Starting point on circle
      var endAngle = Math.PI + (Math.PI * j) / 2 // End point on circle
      var anticlockwise = (i % 2) === 1 // clockwise or anticlockwise

      ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)

      if (i > 1) {
        ctx.fill()
      } else {
        ctx.stroke()
      }
    }
  }
}

tests['arcTo()'] = function (ctx) {
  ctx.fillStyle = '#08C8EE'
  ctx.translate(-50, -50)
  ctx.moveTo(120, 100)
  ctx.lineTo(180, 100)
  ctx.arcTo(200, 100, 200, 120, 5)
  ctx.lineTo(200, 180)
  ctx.arcTo(200, 200, 180, 200, 20)
  ctx.lineTo(120, 200)
  ctx.arcTo(100, 200, 100, 180, 20)
  ctx.lineTo(100, 120)
  ctx.arcTo(100, 100, 120, 100, 20)
  ctx.fill()

  ctx.font = 'bold 25px Arial'
  ctx.fillStyle = '#fff'
  ctx.fillText('node', 120, 155)
}

tests['ellipse() 1'] = function (ctx) {
  var n = 8
  for (var i = 0; i < n; i++) {
    ctx.beginPath()
    var a = i * 2 * Math.PI / n
    var x = 100 + 50 * Math.cos(a)
    var y = 100 + 50 * Math.sin(a)
    ctx.ellipse(x, y, 10, 15, a, 0, 2 * Math.PI)
    ctx.stroke()
  }
}

tests['ellipse() 2'] = function (ctx) {
  var n = 8
  for (var i = 0; i < n; i++) {
    ctx.beginPath()
    var a = i * 2 * Math.PI / n
    var x = 100 + 50 * Math.cos(a)
    var y = 100 + 50 * Math.sin(a)
    ctx.ellipse(x, y, 10, 15, a, 0, a)
    ctx.stroke()
  }
}

tests['ellipse() 3'] = function (ctx) {
  var n = 8
  for (var i = 0; i < n; i++) {
    ctx.beginPath()
    var a = i * 2 * Math.PI / n
    var x = 100 + 50 * Math.cos(a)
    var y = 100 + 50 * Math.sin(a)
    ctx.ellipse(x, y, 10, 15, a, 0, a, true)
    ctx.stroke()
  }
}

tests['ellipse() 4'] = function (ctx) {
  var n = 8
  for (var i = 0; i < n; i++) {
    ctx.beginPath()
    var a = i * 2 * Math.PI / n
    var x = 100 + 50 * Math.cos(a)
    var y = 100 + 50 * Math.sin(a)
    ctx.ellipse(x, y, 10, 15, a, a, 0, true)
    ctx.stroke()
  }
}

tests['bezierCurveTo()'] = function (ctx) {
  ctx.beginPath()
  ctx.moveTo(75, 40)
  ctx.bezierCurveTo(75, 37, 70, 25, 50, 25)
  ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5)
  ctx.bezierCurveTo(20, 80, 40, 102, 75, 120)
  ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5)
  ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25)
  ctx.bezierCurveTo(85, 25, 75, 37, 75, 40)
  ctx.fill()
}

tests['quadraticCurveTo()'] = function (ctx) {
  ctx.beginPath()
  ctx.moveTo(75, 25)
  ctx.quadraticCurveTo(25, 25, 25, 62.5)
  ctx.quadraticCurveTo(25, 100, 50, 100)
  ctx.quadraticCurveTo(50, 120, 30, 125)
  ctx.quadraticCurveTo(60, 120, 65, 100)
  ctx.quadraticCurveTo(125, 100, 125, 62.5)
  ctx.quadraticCurveTo(125, 25, 75, 25)
  ctx.stroke()
}

tests['transform()'] = function (ctx) {
  var sin = Math.sin(Math.PI / 6)
  var cos = Math.cos(Math.PI / 6)
  ctx.translate(100, 100)
  ctx.scale(0.5, 0.5)
  var c = 0
  for (var i = 0; i <= 12; i++) {
    c = Math.floor(255 / 12 * i)
    ctx.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')'
    ctx.fillRect(0, 0, 100, 10)
    ctx.transform(cos, sin, -sin, cos, 0, 0)
  }
}

tests['rotate()'] = function (ctx) {
  ctx.rotate(0.4)
  ctx.translate(30, 0)
  ctx.rect(0, 0, 50, 50)
  ctx.stroke()
}

tests['rotate() 2'] = function (ctx) {
  ctx.translate(75, 75)

  for (var i = 1; i < 6; i++) { // Loop through rings (from inside to out)
    ctx.save()
    ctx.fillStyle = 'rgb(' + (51 * i) + ',' + (255 - 51 * i) + ',255)'

    for (var j = 0; j < i * 6; j++) { // draw individual dots
      ctx.rotate(Math.PI * 2 / (i * 6))
      ctx.beginPath()
      ctx.arc(0, i * 12.5, 5, 0, Math.PI * 2, true)
      ctx.fill()
    }

    ctx.restore()
  }
}

tests['translate()'] = function (ctx) {
  ctx.fillRect(0, 0, 300, 300)
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      ctx.save()
      ctx.strokeStyle = '#9CFF00'
      ctx.translate(50 + j * 100, 50 + i * 100)
      drawSpirograph(ctx, 20 * (j + 2) / (j + 1), -8 * (i + 3) / (i + 1), 10)
      ctx.restore()
    }
  }
  function drawSpirograph (ctx, R, r, O) {
    var x1 = R - O
    var y1 = 0
    var i = 1
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    do {
      if (i > 20000) break
      var x2 = (R + r) * Math.cos(i * Math.PI / 72) - (r + O) * Math.cos(((R + r) / r) * (i * Math.PI / 72))
      var y2 = (R + r) * Math.sin(i * Math.PI / 72) - (r + O) * Math.sin(((R + r) / r) * (i * Math.PI / 72))
      ctx.lineTo(x2, y2)
      x1 = x2
      y1 = y2
      i++
    } while (x2 !== R - O && y2 !== 0)
    ctx.stroke()
  }
}

tests['scale()'] = function (ctx) {
  ctx.strokeStyle = '#fc0'
  ctx.lineWidth = 1.5
  ctx.fillRect(0, 0, 300, 300)

  // Uniform scaling
  ctx.save()
  ctx.translate(50, 50)
  drawSpirograph(ctx, 22, 6, 5) // no scaling

  ctx.translate(100, 0)
  ctx.scale(0.75, 0.75)
  drawSpirograph(ctx, 22, 6, 5)

  ctx.translate(133.333, 0)
  ctx.scale(0.75, 0.75)
  drawSpirograph(ctx, 22, 6, 5)
  ctx.restore()

  // Non-uniform scaling (y direction)
  ctx.strokeStyle = '#0cf'
  ctx.save()
  ctx.translate(50, 150)
  ctx.scale(1, 0.75)
  drawSpirograph(ctx, 22, 6, 5)

  ctx.translate(100, 0)
  ctx.scale(1, 0.75)
  drawSpirograph(ctx, 22, 6, 5)

  ctx.translate(100, 0)
  ctx.scale(1, 0.75)
  drawSpirograph(ctx, 22, 6, 5)
  ctx.restore()

  // Non-uniform scaling (x direction)
  ctx.strokeStyle = '#cf0'
  ctx.save()
  ctx.translate(50, 250)
  ctx.scale(0.75, 1)
  drawSpirograph(ctx, 22, 6, 5)

  ctx.translate(133.333, 0)
  ctx.scale(0.75, 1)
  drawSpirograph(ctx, 22, 6, 5)

  ctx.translate(177.777, 0)
  ctx.scale(0.75, 1)
  drawSpirograph(ctx, 22, 6, 5)
  ctx.restore()
  function drawSpirograph (ctx, R, r, O) {
    var x1 = R - O
    var y1 = 0
    var i = 1
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    do {
      if (i > 20000) break
      var x2 = (R + r) * Math.cos(i * Math.PI / 72) - (r + O) * Math.cos(((R + r) / r) * (i * Math.PI / 72))
      var y2 = (R + r) * Math.sin(i * Math.PI / 72) - (r + O) * Math.sin(((R + r) / r) * (i * Math.PI / 72))
      ctx.lineTo(x2, y2)
      x1 = x2
      y1 = y2
      i++
    } while (x2 !== R - O && y2 !== 0)
    ctx.stroke()
  }
}

tests['rect()'] = function (ctx) {
  ctx.rect(5, 5, 50, 50)
  ctx.strokeStyle = 'yellow'
  ctx.fill()
  ctx.stroke()
}

tests['clip()'] = function (ctx) {
  ctx.arc(50, 50, 50, 0, Math.PI * 2, false)
  ctx.stroke()
  ctx.clip()
  ctx.fillStyle = 'rgba(0,0,0,.5)'
  ctx.fillRect(0, 0, 100, 100)
}

tests['clip() 2'] = function (ctx) {
  ctx.fillRect(0, 0, 150, 150)
  ctx.translate(75, 75)

  // Create a circular clipping path
  ctx.beginPath()
  ctx.arc(0, 0, 60, 0, Math.PI * 2, true)
  ctx.clip()

  // draw background
  var lingrad = ctx.createLinearGradient(0, -75, 0, 75)
  lingrad.addColorStop(0, '#232256')
  lingrad.addColorStop(1, '#143778')

  ctx.fillStyle = lingrad
  ctx.fillRect(-75, -75, 150, 150)

  // draw stars
  for (var j = 1; j < 50; j++) {
    ctx.save()
    ctx.fillStyle = '#fff'
    ctx.translate(75 - Math.floor(Math.random() * 150), 75 - Math.floor(Math.random() * 150))
    drawStar(ctx, Math.floor(Math.random() * 4) + 2)
    ctx.restore()
  }
  function drawStar (ctx, r) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(r, 0)
    for (var i = 0; i < 9; i++) {
      ctx.rotate(Math.PI / 5)
      if ((i % 2) === 0) {
        ctx.lineTo((r / 0.525731) * 0.200811, 0)
      } else {
        ctx.lineTo(r, 0)
      }
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}

tests['createPattern()'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    var pattern = ctx.createPattern(img, 'repeat')
    ctx.scale(0.1, 0.1)
    ctx.fillStyle = pattern
    ctx.fillRect(100, 100, 800, 800)
    ctx.strokeStyle = pattern
    ctx.lineWidth = 200
    ctx.strokeRect(1100, 1100, 800, 800)
    done()
  }
  img.src = imageSrc('face.jpeg')
}

tests['createPattern() with globalAlpha'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    var pattern = ctx.createPattern(img, 'repeat')
    ctx.scale(0.1, 0.1)
    ctx.globalAlpha = 0.6
    ctx.fillStyle = pattern
    ctx.fillRect(100, 100, 800, 800)
    ctx.globalAlpha = 0.2
    ctx.strokeStyle = pattern
    ctx.lineWidth = 200
    ctx.strokeRect(1100, 1100, 800, 800)
    done()
  }
  img.src = imageSrc('face.jpeg')
}

tests['createPattern() no-repeat'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.scale(0.1, 0.1)
    ctx.lineStyle = 'black'
    ctx.lineWidth = 10
    ctx.fillStyle = ctx.createPattern(img, 'no-repeat')
    ctx.fillRect(0, 0, 900, 900)
    ctx.strokeRect(0, 0, 900, 900)
    ctx.fillStyle = ctx.createPattern(img, 'repeat')
    ctx.fillRect(1000, 1000, 900, 900)
    ctx.strokeRect(1000, 1000, 900, 900)
    done()
  }
  img.src = imageSrc('face.jpeg')
}

tests['createLinearGradient()'] = function (ctx) {
  var lingrad = ctx.createLinearGradient(0, 0, 0, 150)
  lingrad.addColorStop(0, '#00ABEB')
  lingrad.addColorStop(0.5, '#fff')
  lingrad.addColorStop(0.5, '#26C000')
  lingrad.addColorStop(1, '#fff')

  var lingrad2 = ctx.createLinearGradient(0, 50, 0, 95)
  lingrad2.addColorStop(0.5, '#000')
  lingrad2.addColorStop(1, 'rgba(0,0,0,0)')

  ctx.fillStyle = lingrad
  ctx.strokeStyle = lingrad2

  ctx.fillRect(10, 10, 130, 130)
  ctx.strokeRect(50, 50, 50, 50)

  // Specifically test that setting the fillStyle to the current fillStyle works
  ctx.fillStyle = '#13b575'
  ctx.fillStyle = ctx.fillStyle // eslint-disable-line no-self-assign
  ctx.fillRect(65, 65, 20, 20)

  var lingrad3 = ctx.createLinearGradient(0, 0, 200, 0)
  lingrad3.addColorStop(0, 'rgba(0,255,0,0.5)')
  lingrad3.addColorStop(0.33, 'rgba(255,255,0,0.5)')
  lingrad3.addColorStop(0.66, 'rgba(0,255,255,0.5)')
  lingrad3.addColorStop(1, 'rgba(255,0,255,0.5)')
  ctx.fillStyle = lingrad3
  ctx.fillRect(0, 170, 200, 30)
}

tests['createLinearGradient() with opacity'] = function (ctx) {
  var lingrad = ctx.createLinearGradient(0, 0, 0, 200)
  lingrad.addColorStop(0, '#00FF00')
  lingrad.addColorStop(0.33, '#FF0000')
  lingrad.addColorStop(0.66, '#0000FF')
  lingrad.addColorStop(1, '#00FFFF')
  ctx.fillStyle = lingrad
  ctx.strokeStyle = lingrad
  ctx.lineWidth = 10
  ctx.globalAlpha = 0.4
  ctx.strokeRect(5, 5, 190, 190)
  ctx.fillRect(0, 0, 50, 50)
  ctx.globalAlpha = 0.6
  ctx.strokeRect(35, 35, 130, 130)
  ctx.fillRect(50, 50, 50, 50)
  ctx.globalAlpha = 0.8
  ctx.strokeRect(65, 65, 70, 70)
  ctx.fillRect(100, 100, 50, 50)
  ctx.globalAlpha = 0.95
  ctx.fillRect(150, 150, 50, 50)
}

tests['createLinearGradient() and transforms'] = function (ctx) {
  var lingrad = ctx.createLinearGradient(0, -100, 0, 100)
  lingrad.addColorStop(0, '#00FF00')
  lingrad.addColorStop(0.33, '#FF0000')
  lingrad.addColorStop(0.66, '#0000FF')
  lingrad.addColorStop(1, '#00FFFF')
  ctx.fillStyle = lingrad
  ctx.translate(100, 100)
  ctx.beginPath()
  ctx.moveTo(-100, -100)
  ctx.lineTo(100, -100)
  ctx.lineTo(100, 100)
  ctx.lineTo(-100, 100)
  ctx.closePath()
  ctx.globalAlpha = 0.5
  ctx.rotate(1.570795)
  ctx.scale(0.6, 0.6)
  ctx.fill()
}

tests['createRadialGradient()'] = function (ctx) {
  // Create gradients
  var radgrad = ctx.createRadialGradient(45, 45, 10, 52, 50, 30)
  radgrad.addColorStop(0, '#A7D30C')
  radgrad.addColorStop(0.9, '#019F62')
  radgrad.addColorStop(1, 'rgba(1,159,98,0)')

  var radgrad2 = ctx.createRadialGradient(105, 105, 20, 112, 120, 50)
  radgrad2.addColorStop(0, '#FF5F98')
  radgrad2.addColorStop(0.75, '#FF0188')
  radgrad2.addColorStop(1, 'rgba(255,1,136,0)')

  var radgrad3 = ctx.createRadialGradient(95, 15, 15, 102, 20, 40)
  radgrad3.addColorStop(0, '#00C9FF')
  radgrad3.addColorStop(0.8, '#00B5E2')
  radgrad3.addColorStop(1, 'rgba(0,201,255,0)')

  var radgrad4 = ctx.createRadialGradient(0, 150, 50, 0, 140, 90)
  radgrad4.addColorStop(0, '#F4F201')
  radgrad4.addColorStop(0.8, '#E4C700')
  radgrad4.addColorStop(1, 'rgba(228,199,0,0)')

  // draw shapes
  ctx.fillStyle = radgrad4
  ctx.fillRect(0, 0, 150, 150)
  ctx.fillStyle = radgrad3
  ctx.fillRect(0, 0, 150, 150)
  ctx.fillStyle = radgrad2
  ctx.fillRect(0, 0, 150, 150)
  ctx.fillStyle = radgrad
  ctx.fillRect(0, 0, 150, 150)
}

tests['globalAlpha'] = function (ctx) {
  ctx.globalAlpha = 0.5
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.strokeRect(0, 0, 50, 50)

  ctx.globalAlpha = 0.8
  ctx.fillRect(20, 20, 20, 20)

  ctx.fillStyle = 'black'
  ctx.globalAlpha = 1
  ctx.fillRect(25, 25, 10, 10)
}

tests['globalAlpha 2'] = function (ctx) {
  ctx.fillStyle = '#FD0'
  ctx.fillRect(0, 0, 75, 75)
  ctx.fillStyle = '#6C0'
  ctx.fillRect(75, 0, 75, 75)
  ctx.fillStyle = '#09F'
  ctx.fillRect(0, 75, 75, 75)
  ctx.fillStyle = '#F30'
  ctx.fillRect(75, 75, 150, 150)
  ctx.fillStyle = '#FFF'

  ctx.globalAlpha = 0.2

  for (var i = 0; i < 7; i++) {
    ctx.beginPath()
    ctx.arc(75, 75, 10 + 10 * i, 0, Math.PI * 2, true)
    ctx.fill()
  }
}

tests['fillStyle'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
}

tests['strokeStyle'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.strokeStyle = 'rgb(0,' + Math.floor(255 - 42.5 * i) + ',' +
                       Math.floor(255 - 42.5 * j) + ')'
      ctx.beginPath()
      ctx.arc(12.5 + j * 25, 12.5 + i * 25, 10, 0, Math.PI * 2, true)
      ctx.stroke()
    }
  }
}

tests['fill with stroke'] = function (ctx) {
  ctx.beginPath()
  ctx.arc(75, 75, 50, 0, Math.PI * 2, true)
  ctx.fill()
  ctx.closePath()
  ctx.beginPath()
  ctx.fillStyle = 'red'
  ctx.strokeStyle = 'yellow'
  ctx.arc(75, 75, 30, 0, Math.PI * 2, true)
  ctx.fill()
  ctx.stroke()
}

tests['floating point coordinates'] = function (ctx) {
  ctx.lineCap = 'square'
  for (var i = 0; i < 70; i += 3.05) {
    ctx.rect(i + 3, 10.5, 0, 130)
    ctx.moveTo(i + 77, 10.5)
    ctx.lineTo(i + 77, 140.5)
  }
  ctx.stroke()
}

tests['lineWidth'] = function (ctx) {
  for (var i = 0; i < 10; i++) {
    ctx.lineWidth = 1 + i
    ctx.beginPath()
    ctx.moveTo(5 + i * 14, 5)
    ctx.lineTo(5 + i * 14, 140)
    ctx.stroke()
  }
}

tests['line caps'] = function (ctx) {
  var lineCap = ['butt', 'round', 'square']

  ctx.strokeStyle = '#09f'
  ctx.beginPath()
  ctx.moveTo(10, 10)
  ctx.lineTo(140, 10)
  ctx.moveTo(10, 140)
  ctx.lineTo(140, 140)
  ctx.stroke()

  ctx.strokeStyle = 'black'
  for (var i = 0; i < lineCap.length; i++) {
    ctx.lineWidth = 15
    ctx.lineCap = lineCap[i]
    ctx.beginPath()
    ctx.moveTo(25 + i * 50, 10)
    ctx.lineTo(25 + i * 50, 140)
    ctx.stroke()
  }
}

tests['line join'] = function (ctx) {
  var lineJoin = ['round', 'bevel', 'miter']
  ctx.lineWidth = 10
  for (var i = 0; i < lineJoin.length; i++) {
    ctx.lineJoin = lineJoin[i]
    ctx.beginPath()
    ctx.moveTo(-5, 5 + i * 40)
    ctx.lineTo(35, 45 + i * 40)
    ctx.lineTo(75, 5 + i * 40)
    ctx.lineTo(115, 45 + i * 40)
    ctx.lineTo(155, 5 + i * 40)
    ctx.stroke()
  }
}

tests['lineCap default'] = function (ctx) {
  ctx.beginPath()
  ctx.lineWidth = 10.0
  ctx.moveTo(50, 50)
  ctx.lineTo(50, 100)
  ctx.lineTo(80, 120)
  ctx.stroke()
}

tests['lineCap'] = function (ctx) {
  ctx.beginPath()
  ctx.lineWidth = 10.0
  ctx.lineCap = 'round'
  ctx.moveTo(50, 50)
  ctx.lineTo(50, 100)
  ctx.lineTo(80, 120)
  ctx.stroke()
}

tests['lineJoin'] = function (ctx) {
  ctx.beginPath()
  ctx.lineWidth = 10.0
  ctx.lineJoin = 'round'
  ctx.moveTo(50, 50)
  ctx.lineTo(50, 100)
  ctx.lineTo(80, 120)
  ctx.stroke()
}

tests['states'] = function (ctx) {
  ctx.save()
  ctx.rect(50, 50, 100, 100)
  ctx.stroke()

  ctx.restore()
  ctx.save()
  ctx.translate(50, 50)
  ctx.scale(0.5, 0.5)
  ctx.strokeRect(51, 51, 100, 100)

  ctx.restore()
  ctx.translate(95, 95)
  ctx.fillRect(0, 0, 10, 10)
}

tests['states with stroke/fill/globalAlpha'] = function (ctx) {
  ctx.fillRect(0, 0, 150, 150)
  ctx.save()

  ctx.fillStyle = '#09F'
  ctx.fillRect(15, 15, 120, 120)

  ctx.save()
  ctx.fillStyle = '#FFF'
  ctx.globalAlpha = 0.5
  ctx.fillRect(30, 30, 90, 90)

  ctx.restore()
  ctx.fillRect(45, 45, 60, 60)

  ctx.restore()
  ctx.fillRect(60, 60, 30, 30)
}

tests['path through fillRect/strokeRect/clearRect'] = function (ctx) {
  // left: fillRect()
  ctx.beginPath()
  ctx.rect(0, 50, 50, 50)
  ctx.fillStyle = '#F00'
  ctx.fillRect(10, 60, 30, 30)
  ctx.fillStyle = '#0F0'
  ctx.fill()

  // center: strokeRect()
  ctx.beginPath()
  ctx.rect(50, 50, 50, 50)
  ctx.strokeStyle = '#F00'
  ctx.lineWidth = 5
  ctx.strokeRect(60, 60, 30, 30)
  ctx.fillStyle = '#0F0'
  ctx.fill()

  // right: clearRect()
  ctx.beginPath()
  ctx.rect(100, 50, 50, 50)
  ctx.fillStyle = '#0F0'
  ctx.fill()
  ctx.clearRect(110, 60, 30, 30)
  ctx.fill()
}

tests['invalid stroke/fill styles'] = function (ctx) {
  ctx.fillStyle = 'red'
  ctx.strokeStyle = 'yellow'
  ctx.rect(50, 50, 50, 50)
  ctx.fill()
  ctx.stroke()
  ctx.beginPath()
  ctx.fillStyle = 'asdf'
  ctx.strokeStyle = 'asdf'
  ctx.rect(100, 80, 15, 15)
  ctx.fill()
  ctx.stroke()
}

tests['fillText()'] = function (ctx) {
  ctx.font = '30px Arial'
  ctx.rotate(0.1)
  ctx.lineTo(10, 10)
  ctx.fillText('Awesome!', 50, 100)

  var te = ctx.measureText('Awesome!')

  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  ctx.lineTo(50, 102)
  ctx.lineTo(50 + te.width, 102)
  ctx.stroke()
}

tests['fillText() transformations'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.font = 'bold 12px Helvetica'

  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(100, 0)
  ctx.lineTo(100, 200)
  ctx.stroke()

  ctx.rotate(0.2)
  ctx.fillText('foo', 150, 100)
  ctx.font = 'normal 30px Arial'
  ctx.fillText('bar', 50, 100)
}

tests['fillText() maxWidth argument'] = function (ctx) {
  ctx.font = 'Helvetica, sans'
  ctx.fillText('Drawing text can be fun!', 0, 20)

  for (var i = 1; i < 6; i++) {
    ctx.fillText('Drawing text can be fun!', 0, 20 * (7 - i), i * 20)
  }

  ctx.fillText('Drawing text can be fun!', 0, 20 * 7)
}

tests['maxWidth bug first usage path'] = function (ctx, done) {
  ctx.textDrawingMode = 'path'
  ctx.fillText('Drawing text can be fun!', 0, 20, 50)
  ctx.fillText('Drawing text can be fun!', 0, 40, 50)
  ctx.fillText('Drawing text can be fun changing text bug!', 0, 60, 50)
  done()
}

tests['maxWidth bug first usage glyph'] = function (ctx, done) {
  ctx.textDrawingMode = 'glyph'
  ctx.fillText('Drawing text can be fun!', 0, 20, 50)
  ctx.fillText('Drawing text can be fun!', 0, 40, 50)
  ctx.fillText('Drawing text can be fun changing text bug!', 0, 60, 50)
  done()
}

tests['fillText() maxWidth argument + textAlign center (#1253)'] = function (ctx) {
  ctx.font = 'Helvetica, sans'
  ctx.textAlign = 'center'
  ctx.fillText('Drawing text can be fun!', 100, 20)

  for (var i = 1; i < 6; i++) {
    ctx.fillText('Drawing text can be fun!', 100, 20 * (7 - i), i * 20)
  }

  ctx.fillText('Drawing text can be fun!', 100, 20 * 7)
}

tests['fillText() maxWidth argument + textAlign right'] = function (ctx) {
  ctx.font = 'Helvetica, sans'
  ctx.textAlign = 'right'
  ctx.fillText('Drawing text can be fun!', 200, 20)

  for (var i = 1; i < 6; i++) {
    ctx.fillText('Drawing text can be fun!', 200, 20 * (7 - i), i * 20)
  }

  ctx.fillText('Drawing text can be fun!', 200, 20 * 7)
}

tests['strokeText()'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(100, 0)
  ctx.lineTo(100, 200)
  ctx.stroke()

  ctx.strokeStyle = 'red'
  ctx.font = 'normal 50px Arial'
  ctx.strokeText('bar', 100, 100)
}

tests['strokeText() maxWidth argument'] = function (ctx) {
  ctx.font = 'Helvetica, sans'
  ctx.strokeText('Drawing text can be fun!', 0, 20)

  for (var i = 1; i < 6; i++) {
    ctx.strokeText('Drawing text can be fun!', 0, 20 * (7 - i), i * 20)
  }

  ctx.strokeText('Drawing text can be fun!', 0, 20 * 7)
}

tests['textAlign right'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(100, 0)
  ctx.lineTo(100, 200)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textAlign = 'right'
  ctx.fillText('right', 100, 100)
}

tests['textAlign left'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(100, 0)
  ctx.lineTo(100, 200)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textAlign = 'left'
  ctx.fillText('left', 100, 100)
}

tests['textAlign center'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(100, 0)
  ctx.lineTo(100, 200)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('center', 100, 100)
}

tests['textBaseline alphabetic'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'
  ctx.fillText('alphabetic', 100, 100)
}

tests['textBaseline top'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.fillText('top', 100, 100)
}

tests['textBaseline hanging'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textBaseline = 'hanging'
  ctx.textAlign = 'center'
  ctx.fillText('hanging', 100, 100)
}

tests['textBaseline middle'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('middle', 100, 100)
}

tests['textBaseline ideographic'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textBaseline = 'ideographic'
  ctx.textAlign = 'center'
  ctx.fillText('ideographic', 100, 100)
}

tests['textBaseline bottom'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'center'
  ctx.fillText('bottom', 100, 100)
}

tests['font size px'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('normal 14px Arial', 100, 100)
}

tests['font size pt'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 14pt Arial'
  ctx.textAlign = 'center'
  ctx.fillText('normal 14pt Arial', 100, 100)
}

tests['font size mm'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 3mm Arial'
  ctx.textAlign = 'center'
  ctx.fillText('normal 3mm Arial', 100, 100)
}

tests['font size cm'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal 0.6cm Arial'
  ctx.textAlign = 'center'
  ctx.fillText('normal 0.6cm Arial', 100, 100)
}

tests['font weight bold'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'bold 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('bold 14px Arial', 100, 100)
}

tests['font weight lighter'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'lighter 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('lighter 14px Arial', 100, 100)
}

tests['font weight lighter italic'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'lighter italic 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('lighter italic 14px Arial', 100, 100)
}

tests['font weight 200'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = '200 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('200 14px Arial', 100, 100)
}

tests['font weight 800'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = '800 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('800 14px Arial', 100, 100)
}

tests['font family serif'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = '14px serif'
  ctx.textAlign = 'center'
  ctx.fillText('14px serif', 100, 100)
}

tests['font family sans-serif'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = '14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('14px sans-serif', 100, 100)
}

tests['font family Impact'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = '18px Impact'
  ctx.textAlign = 'center'
  ctx.fillText('18px Impact', 100, 100)
}

tests['font family invalid'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = '14px Foo, Invalid, Impact, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('14px Invalid, Impact', 100, 100)
}

tests['font style variant weight size family'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 100)
  ctx.lineTo(200, 100)
  ctx.stroke()

  ctx.font = 'normal normal normal 16px Impact'
  ctx.textAlign = 'center'
  ctx.fillText('normal normal normal 16px', 100, 100)
}

// From https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
const gco = [
  'source-over', 'source-in', 'source-out', 'source-atop',
  'destination-over', 'destination-in', 'destination-out', 'destination-atop',
  'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay', 'darken',
  'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
]

gco.forEach(op => {
  tests['globalCompositeOperator ' + op] = function (ctx, done) {
    var img1 = new Image()
    var img2 = new Image()
    img1.onload = function () {
      img2.onload = function () {
        ctx.globalAlpha = 0.7
        ctx.drawImage(img1, 0, 0)
        ctx.globalCompositeOperation = op
        ctx.drawImage(img2, 0, 0)
        done()
      }
      img2.src = imageSrc('newcontent.png')
    }
    img1.src = imageSrc('existing.png')
  }
})

gco.forEach(op => {
  tests['9 args, transform, globalCompositeOperator ' + op] = function (ctx, done) {
    var img1 = new Image()
    var img2 = new Image()
    img1.onload = function () {
      img2.onload = function () {
        ctx.globalAlpha = 0.7
        ctx.drawImage(img1, 0, 0)
        ctx.globalCompositeOperation = op
        ctx.rotate(0.1)
        ctx.scale(0.8, 1.2)
        ctx.translate(5, -5)
        ctx.drawImage(img2, -80, -50, 400, 400, 10, 10, 180, 180)
        done()
      }
      img2.src = imageSrc('newcontent.png')
    }
    img1.src = imageSrc('existing.png')
  }
})

tests['drawImage issue #1249'] = function (ctx, done) {
  var img1 = new Image()
  var img2 = new Image()
  img1.onload = function () {
    img2.onload = function () {
      ctx.drawImage(img1, 0, 0, 200, 200)
      ctx.drawImage(img2, -8, -8, 18, 18, 0, 0, 200, 200)
      ctx.restore()
      done()
    }
    img2.src = imageSrc('checkers.png')
  }
  img1.src = imageSrc('chrome.jpg')
}

tests['drawImage 9 arguments big numbers'] = function (ctx, done) {
  var img = new Image()
  ctx.imageSmoothingEnabled = false
  img.onload = function () {
    // we use big numbers because is over the max canvas allowed
    ctx.drawImage(img, -90000, -90000, 90080, 90080, -180000, -18000, 180160, 18016)
    ctx.drawImage(img, -90000, -90000, 90040, 90040, -179930, -179930, 180060, 180060)
    ctx.drawImage(img, -90000, -90000, 90080, 90080, -18000, -180000, 18016, 180160)
    ctx.drawImage(img, 475, 380, 90000, 90000, 20, 20, 180000, 720000)
    done(null)
  }
  img.onerror = function () {
    done(new Error('Failed to load image'))
  }
  img.src = imageSrc('face.jpeg')
}

tests['known bug #416'] = function (ctx, done) {
  var img1 = new Image()
  var img2 = new Image()
  img1.onload = function () {
    img2.onload = function () {
      ctx.drawImage(img1, 0, 0)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.save()
      ctx.translate(img2.width / 2, img1.height / 2)
      ctx.rotate(Math.PI / 4)
      ctx.scale(0.5, 0.5)
      ctx.translate(-img2.width / 2, -img1.height / 2)
      ctx.drawImage(img2, 0, 0)
      ctx.restore()
      done()
    }
    img2.src = imageSrc('newcontent.png')
  }
  img1.src = imageSrc('existing.png')
}

tests['shadowBlur'] = function (ctx) {
  ctx.fillRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#000'
  ctx.shadowBlur = 5
  ctx.fillRect(20, 20, 100, 100)

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.fillRect(150, 150, 20, 20)
}

tests['shadowColor'] = function (ctx) {
  ctx.fillRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#c00'
  ctx.shadowBlur = 5
  ctx.fillRect(20, 20, 100, 100)

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.fillRect(150, 150, 20, 20)
}

tests['shadowOffset{X,Y}'] = function (ctx) {
  ctx.fillRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#c00'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.fillRect(20, 20, 100, 100)

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.fillRect(150, 150, 20, 20)
}

tests['shadowOffset{X,Y} large'] = function (ctx) {
  ctx.fillRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#c00'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 10
  ctx.shadowOffsetY = 10
  ctx.fillRect(20, 20, 100, 100)

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.fillRect(150, 150, 20, 20)
}

tests['shadowOffset{X,Y} negative'] = function (ctx) {
  ctx.fillRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#c00'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = -10
  ctx.shadowOffsetY = -10
  ctx.fillRect(20, 20, 100, 100)

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.fillRect(150, 150, 20, 20)
}

tests['shadowOffset{X,Y} transform'] = function (ctx) {
  ctx.translate(100, 0)
  ctx.scale(0.75, 0.75)
  ctx.rotate(Math.PI / 4)

  ctx.fillRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#c00'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 10
  ctx.shadowOffsetY = 10
  ctx.fillRect(20, 20, 100, 100)

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.fillRect(150, 150, 20, 20)
}

tests['shadowBlur values'] = function (ctx) {
  ctx.fillRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#c00'
  ctx.shadowBlur = 25
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.fillRect(20, 20, 100, 100)

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowColor = 'rgba(0,0,0,0)'

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.fillRect(150, 150, 20, 20)
}

tests['shadow strokeRect()'] = function (ctx) {
  ctx.strokeRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#000'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.strokeRect(20, 20, 100, 100)

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowColor = 'rgba(0,0,0,0)'

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.strokeRect(150, 150, 20, 20)
}

tests['shadow fill()'] = function (ctx) {
  ctx.strokeRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#000'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.rect(20, 20, 100, 100)
  ctx.fill()

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowColor = 'rgba(0,0,0,0)'

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.strokeRect(150, 150, 20, 20)
}

tests['shadow stroke()'] = function (ctx) {
  ctx.strokeRect(150, 10, 20, 20)

  ctx.lineTo(20, 5)
  ctx.lineTo(100, 5)
  ctx.stroke()

  ctx.shadowColor = '#000'
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.rect(20, 20, 100, 100)
  ctx.stroke()

  ctx.beginPath()
  ctx.lineTo(20, 150)
  ctx.lineTo(100, 150)
  ctx.stroke()

  ctx.shadowColor = 'rgba(0,0,0,0)'

  ctx.beginPath()
  ctx.lineTo(20, 180)
  ctx.lineTo(100, 180)
  ctx.stroke()

  ctx.strokeRect(150, 150, 20, 20)
}

tests['shadow globalAlpha'] = function (ctx) {
  ctx.lineTo(0, 0)
  ctx.lineTo(50, 0)
  ctx.lineTo(50, 150)
  ctx.stroke()

  ctx.lineWidth = 5
  ctx.globalAlpha = 0.3
  ctx.shadowColor = '#00c'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 8
  ctx.shadowOffsetY = 8

  ctx.lineTo(0, 150)
  ctx.stroke()
}

tests['shadow fillText()'] = function (ctx) {
  ctx.shadowColor = '#00c'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 8
  ctx.shadowOffsetY = 8
  ctx.textAlign = 'center'
  ctx.font = '35px Arial'
  ctx.fillText('Shadow', 100, 100)
}

tests['shadow strokeText()'] = function (ctx) {
  ctx.shadowColor = '#00c'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 8
  ctx.shadowOffsetY = 8
  ctx.textAlign = 'center'
  ctx.font = '35px Arial'
  ctx.strokeText('Shadow', 100, 100)
}

tests['shadow transform text'] = function (ctx) {
  ctx.shadowColor = '#c0c'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 6
  ctx.shadowOffsetY = 10
  ctx.textAlign = 'center'
  ctx.font = '35px Arial'
  ctx.scale(2, 2)
  ctx.strokeText('Sha', 33, 40)
  ctx.rotate(Math.PI / 2)
  ctx.fillText('dow', 50, -72)
}

tests['shadow image'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.shadowColor = '#f3ac22'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 8
    ctx.shadowOffsetY = 8
    ctx.drawImage(img, 0, 0)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('star.png')
}

tests['shadow image with crop'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.shadowColor = '#000'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 4

    // cropped
    ctx.drawImage(img, 100, 100, 150, 150, 25, 25, 150, 150)
    done(null)
  }
  img.onerror = function () {
    done(new Error('Failed to load image'))
  }
  img.src = imageSrc('face.jpeg')
}

tests['shadow image with crop and zoom'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.shadowColor = '#000'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 4

    // cropped
    ctx.drawImage(img, 100, 100, 40, 40, 25, 25, 150, 150)
    done(null)
  }
  img.onerror = function () {
    done(new Error('Failed to load image'))
  }
  img.src = imageSrc('face.jpeg')
}

tests['drawImage canvas over canvas'] = function (ctx) {
  // Drawing canvas to itself
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 200, 200)
  ctx.fillStyle = 'black'
  ctx.fillRect(5, 5, 10, 10)
  ctx.drawImage(ctx.canvas, 20, 20)
}

tests['scaled shadow image'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.shadowColor = '#f3ac22'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 8
    ctx.shadowOffsetY = 8
    ctx.drawImage(img, 10, 10, 80, 80)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('star.png')
}

tests['smoothing disabled image'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.imageSmoothingEnabled = false
    ctx.patternQuality = 'good'
    // cropped
    ctx.drawImage(img, 0, 0, 10, 10, 0, 0, 200, 200)
    done(null)
  }
  img.onerror = function () {
    done(new Error('Failed to load image'))
  }
  img.src = imageSrc('face.jpeg')
}

tests['createPattern() with globalAlpha and smoothing off scaling down'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.imageSmoothingEnabled = false
    ctx.patternQuality = 'good'
    var pattern = ctx.createPattern(img, 'repeat')
    ctx.scale(0.1, 0.1)
    ctx.globalAlpha = 0.95
    ctx.fillStyle = pattern
    ctx.fillRect(100, 100, 800, 800)
    ctx.globalAlpha = 1
    ctx.strokeStyle = pattern
    ctx.lineWidth = 800
    ctx.strokeRect(1400, 1100, 1, 800)
    done()
  }
  img.src = imageSrc('face.jpeg')
}

tests['createPattern() with globalAlpha and smoothing off scaling up'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.imageSmoothingEnabled = false
    ctx.patternQuality = 'good'
    var pattern = ctx.createPattern(img, 'repeat')
    ctx.scale(20, 20)
    ctx.globalAlpha = 0.95
    ctx.fillStyle = pattern
    ctx.fillRect(1, 1, 8, 3)
    ctx.globalAlpha = 1
    ctx.strokeStyle = pattern
    ctx.lineWidth = 2
    ctx.strokeRect(2, 6, 6, 1)
    done()
  }
  img.src = imageSrc('face.jpeg')
}

tests['smoothing and gradients (gradients are not influenced by patternQuality)'] = function (ctx) {
  var grad1 = ctx.createLinearGradient(0, 0, 10, 10)
  grad1.addColorStop(0, 'yellow')
  grad1.addColorStop(0.25, 'red')
  grad1.addColorStop(0.75, 'blue')
  grad1.addColorStop(1, 'limegreen')
  ctx.imageSmoothingEnabled = false
  ctx.patternQuality = 'nearest'
  ctx.globalAlpha = 0.9
  // linear grad box
  ctx.fillStyle = grad1
  ctx.moveTo(0, 0)
  ctx.lineTo(200, 0)
  ctx.lineTo(200, 200)
  ctx.lineTo(0, 200)
  ctx.lineTo(0, 0)
  ctx.scale(20, 20)
  ctx.fill()
}

tests['shadow integration'] = function (ctx) {
  ctx.shadowBlur = 5
  ctx.shadowOffsetX = 10
  ctx.shadowOffsetY = 10
  ctx.shadowColor = '#eee'
  ctx.lineWidth = 3

  var grad1 = ctx.createLinearGradient(105, 0, 200, 100)
  grad1.addColorStop(0, 'yellow')
  grad1.addColorStop(0.25, 'red')
  grad1.addColorStop(0.75, 'blue')
  grad1.addColorStop(1, 'limegreen')

  var grad2 = ctx.createRadialGradient(50, 50, 10, 50, 50, 50)
  grad2.addColorStop(0, 'yellow')
  grad2.addColorStop(0.25, 'red')
  grad2.addColorStop(0.75, 'blue')
  grad2.addColorStop(1, 'limegreen')

  // linear grad box
  ctx.fillStyle = grad1
  ctx.fillRect(105, 0, 100, 100)

  // skyblue box
  ctx.fillStyle = 'skyblue'
  ctx.fillRect(105, 101, 100, 100)

  // radial grad oval
  ctx.beginPath()
  ctx.arc(50, 50, 50, 0, Math.PI * 2, false)
  ctx.fillStyle = grad2
  ctx.fill()

  // gold oval
  ctx.beginPath()
  ctx.arc(50, 151, 50, 0, Math.PI * 2, false)
  ctx.fillStyle = 'gold'
  ctx.fill()
}

tests['font state'] = function (ctx) {
  ctx.save()
  ctx.font = '20px Impact'
  ctx.fillText('Bam!', 50, 80)

  ctx.save()
  ctx.font = '10px Arial'
  ctx.fillText('Boom!', 50, 100)

  ctx.restore()
  ctx.fillText('Bam again!', 50, 120)

  ctx.restore()
  ctx.fillText('Boom again!', 50, 140)
}

tests['drawImage(img,0,0)'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['drawImage(img) jpeg'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 100, 100)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('face.jpeg')
}

tests['drawImage(img) YCCK JPEG (#425)'] = function (ctx, done) {
  // This also provides coverage for CMYK JPEGs
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 100, 100)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('ycck.jpg')
}

tests['drawImage(img) grayscale JPEG'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 100, 100)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('grayscale.jpg')
}

tests['drawImage(img) svg'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 100, 100)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('tree.svg')
}

tests['drawImage(img) svg with scaling from drawImage'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, -800, -800, 1000, 1000)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('tree.svg')
}

tests['drawImage(img) svg with scaling from ctx'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.scale(100, 100)
    ctx.drawImage(img, -8, -8, 10, 10)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('tree.svg')
}

tests['drawImage(img,x,y)'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 5, 25)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['drawImage(img,x,y,w,h) scale down'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 25, 25, 10, 10)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['drawImage(img,x,y,w,h) scale down in a scaled up context'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.scale(20, 20)
    ctx.drawImage(img, 0, 0, 10, 10)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['drawImage(img,x,y,w,h) scale up'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 200, 200)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['drawImage(img,x,y,w,h) scale vertical'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 0, 0, img.width, 200)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['drawImage(img,sx,sy,sw,sh,x,y,w,h)'] = function (ctx, done) {
  var img = new Image()
  img.onload = function () {
    ctx.drawImage(img, 13, 13, 45, 45, 25, 25, img.width / 2, img.height / 2)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['drawImage(img,0,0) globalAlpha'] = function (ctx, done) {
  var img = new Image()
  ctx.fillRect(50, 50, 30, 30)
  ctx.globalAlpha = 0.5
  img.onload = function () {
    ctx.drawImage(img, 0, 0)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['drawImage(img,0,0) clip'] = function (ctx, done) {
  ctx.arc(50, 50, 50, 0, Math.PI * 2, false)
  ctx.stroke()
  ctx.clip()
  var img = new Image()
  ctx.fillRect(50, 50, 30, 30)
  ctx.globalAlpha = 0.5
  img.onload = function () {
    ctx.drawImage(img, 0, 0)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['putImageData()'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  var data = ctx.getImageData(0, 0, 50, 50)
  ctx.putImageData(data, 10, 10)
}

tests['putImageData() 1'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  var data = ctx.getImageData(0, 0, 50, 50)
  ctx.putImageData(data, -10, -10)
}

tests['putImageData() 2'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  var data = ctx.getImageData(25, 25, 50, 50)
  ctx.putImageData(data, 10, 10)
}

tests['putImageData() 3'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  var data = ctx.getImageData(10, 25, 10, 50)
  ctx.putImageData(data, 50, 10)
}

tests['putImageData() 4'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' +
                       Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  ctx.strokeRect(30, 30, 30, 30)
  var data = ctx.getImageData(0, 0, 50, 50)
  ctx.putImageData(data, 30, 30, 10, 10, 30, 30)
}

tests['putImageData() 5'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  ctx.strokeRect(60, 60, 50, 30)
  var data = ctx.getImageData(0, 0, 50, 50)
  ctx.putImageData(data, 60, 60, 0, 0, 50, 30)
}

tests['putImageData() 6'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  ctx.strokeRect(60, 60, 50, 30)
  var data = ctx.getImageData(0, 0, 50, 50)
  ctx.putImageData(data, 60, 60, 10, 0, 35, 30)
}

tests['putImageData() 7'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  ctx.strokeRect(60, 60, 50, 30)
  ctx.translate(20, 20)
  var data = ctx.getImageData(0, 0, 50, 50)
  ctx.putImageData(data, 60, 60, 10, 20, 35, -10)
}

tests['putImageData() 8'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  ctx.translate(20, 20)
  var data = ctx.getImageData(0, 0, 50, 50)
  ctx.putImageData(data, -10, -10, 0, 20, 35, 30)
}

tests['putImageData() 9'] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' + Math.floor(255 - 42.5 * j) + ',0)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
  ctx.translate(20, 20)
  var data = ctx.getImageData(0, 0, 50, 50)
  ctx.putImageData(data, -10, -10, 0, 20, 500, 500)
}

tests['putImageData() 10'] = function (ctx) {
  ctx.fillStyle = 'rgba(255,0,0,1)'
  ctx.fillRect(0, 0, 50, 100)
  ctx.fillStyle = 'rgba(0,255,0,1)'
  ctx.fillRect(50, 0, 50, 100)
  ctx.fillStyle = 'rgba(0,0,255,1)'
  ctx.fillRect(100, 0, 50, 100)

  var data = ctx.getImageData(0, 0, 120, 20)
  ctx.putImageData(data, 20, 120)
}

tests['putImageData() alpha'] = function (ctx) {
  ctx.fillStyle = 'rgba(255,0,0,0.5)'
  ctx.fillRect(0, 0, 50, 100)
  ctx.fillStyle = 'rgba(0,255,0,0.5)'
  ctx.fillRect(50, 0, 50, 100)
  ctx.fillStyle = 'rgba(0,0,255,0.5)'
  ctx.fillRect(100, 0, 50, 100)

  var data = ctx.getImageData(0, 0, 120, 20)
  ctx.putImageData(data, 20, 120)
}

tests['putImageData() alpha 2'] = function (ctx) {
  ctx.fillStyle = 'rgba(255,0,0,0.2)'
  ctx.fillRect(0, 0, 50, 100)
  ctx.fillStyle = 'rgba(0,255,0,0.5)'
  ctx.fillRect(50, 0, 50, 100)
  ctx.fillStyle = 'rgba(0,0,255,0.75)'
  ctx.fillRect(100, 0, 50, 100)

  var data = ctx.getImageData(0, 0, 120, 20)
  ctx.putImageData(data, 20, 120)
}

tests['putImageData() globalAlpha'] = function (ctx) {
  ctx.globalAlpha = 0.5
  ctx.fillStyle = '#f00'
  ctx.fillRect(0, 0, 50, 100)
  ctx.fillStyle = '#0f0'
  ctx.fillRect(50, 0, 50, 100)
  ctx.fillStyle = '#00f'
  ctx.fillRect(100, 0, 50, 100)

  var data = ctx.getImageData(0, 0, 120, 20)
  ctx.putImageData(data, 20, 120)
}

tests['putImageData() png data'] = function (ctx, done) {
  var img = new Image()
  ctx.fillRect(50, 50, 30, 30)
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 200, 200)
    var imageData = ctx.getImageData(0, 0, 50, 50)
    var data = imageData.data
    if (data instanceof Uint8ClampedArray) {
      for (var i = 0, len = data.length; i < len; i += 4) {
        data[i + 3] = 80
      }
    }
    ctx.putImageData(imageData, 50, 50)
    done(null)
  }

  img.onerror = done

  img.src = imageSrc('state.png')
}

tests['putImageData() png data 2'] = function (ctx, done) {
  var img = new Image()
  ctx.fillRect(50, 50, 30, 30)
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 200, 200)
    var imageData = ctx.getImageData(0, 0, 50, 50)
    var data = imageData.data
    if (data instanceof Uint8ClampedArray) {
      for (var i = 0, len = data.length; i < len; i += 4) {
        data[i + 3] = 80
      }
    }
    ctx.putImageData(imageData, 50, 50, 10, 10, 20, 20)
    done(null)
  }

  img.onerror = done

  img.src = imageSrc('state.png')
}

tests['putImageData() png data 3'] = function (ctx, done) {
  var img = new Image()
  ctx.fillRect(50, 50, 30, 30)
  img.onload = function () {
    ctx.drawImage(img, 0, 0, 200, 200)
    var imageData = ctx.getImageData(0, 0, 50, 50)
    var data = imageData.data
    if (data instanceof Uint8ClampedArray) {
      for (var i = 0, len = data.length; i < len; i += 4) {
        data[i + 0] = data[i + 0] * 0.2
        data[i + 1] = data[i + 1] * 0.2
        data[i + 2] = data[i + 2] * 0.2
      }
    }
    ctx.putImageData(imageData, 50, 50)
    done(null)
  }
  img.onerror = done
  img.src = imageSrc('state.png')
}

tests['setLineDash'] = function (ctx) {
  ctx.setLineDash([10, 5, 25, 15])
  ctx.lineWidth = 14

  var y = 5
  var line = function (lineDash, color) {
    ctx.setLineDash(lineDash)
    if (color) ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(200, y)
    ctx.stroke()
    y += ctx.lineWidth + 4
  }

  line([15, 30], 'blue')
  line([], 'black')
  line([5, 10, 15, 20, 25, 30, 35, 40, 45, 50], 'purple')
  line([8], 'green')
  line([3, 3, -30], 'red')
  line([4, Infinity, 4])
  line([10, 10, NaN])
  line((function () {
    ctx.setLineDash([8])
    var a = ctx.getLineDash()
    a[0] -= 3
    a.push(20)
    return a
  })(), 'orange')
  line([0, 0], 'purple') // should be full
  line([0, 0, 3, 0], 'orange') // should be full
  line([0, 3, 0, 0], 'green') // should be empty
}

tests['lineDashOffset'] = function (ctx) {
  ctx.setLineDash([10, 5, 25, 15])
  ctx.lineWidth = 4

  var y = 5
  var line = function (lineDashOffset, color) {
    ctx.lineDashOffset = lineDashOffset
    if (color) ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(200, y)
    ctx.stroke()
    y += ctx.lineWidth + 4
  }

  line(-10, 'black')
  line(0)
  line(10)
  line(20)
  line(30)
  line(40, 'blue')
  line(NaN)
  line(50, 'green')
  line(Infinity)
  line(60, 'orange')
  line(-Infinity)
  line(70, 'purple')
  line(void 0)
  line(80, 'black')
  line(ctx.lineDashOffset + 10)

  for (var i = 0; i < 10; i++) {
    line(90 + i / 5, 'red')
  }
}

tests['fillStyle=\'hsl(...)\''] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'hsl(' + (360 - 60 * i) + ',' + (100 - 16.66 * j) + '%,' + (50 + (i + j) * (50 / 12)) + '%)'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
}

tests['fillStyle=\'hsla(...)\''] = function (ctx) {
  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      ctx.fillStyle = 'hsla(' + (360 - 60 * i) + ',' + (100 - 16.66 * j) + '%,50%,' + (1 - 0.16 * j) + ')'
      ctx.fillRect(j * 25, i * 25, 25, 25)
    }
  }
}

tests['textBaseline and scale'] = function (ctx) {
  ctx.strokeStyle = '#666'
  ctx.strokeRect(0, 0, 200, 200)
  ctx.lineTo(0, 50)
  ctx.lineTo(200, 50)
  ctx.stroke()
  ctx.beginPath()
  ctx.lineTo(0, 150)
  ctx.lineTo(200, 150)
  ctx.stroke()

  ctx.font = 'normal 20px Arial'
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'center'
  ctx.fillText('bottom', 100, 50)

  ctx.scale(0.1, 0.1)
  ctx.font = 'normal 200px Arial'
  ctx.textBaseline = 'bottom'
  ctx.textAlign = 'center'
  ctx.fillText('bottom', 1000, 1500)
}

tests['rotated baseline'] = function (ctx) {
  ctx.font = '12px Arial'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.translate(100, 100)

  for (var i = 0; i < 16; i++) {
    ctx.fillText('Hello world!', -50, -50)
    ctx.rotate(-Math.PI / 8)
  }
}

tests['rotated and scaled baseline'] = function (ctx) {
  ctx.font = '120px Arial'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.translate(100, 100)
  ctx.scale(0.1, 0.2)

  for (var i = 0; i < 16; i++) {
    ctx.fillText('Hello world!', -50 / 0.1, -50 / 0.2)
    ctx.rotate(-Math.PI / 8)
  }
}

tests['rotated and skewed baseline'] = function (ctx) {
  ctx.font = '12px Arial'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.translate(100, 100)
  ctx.transform(1, 1, 0, 1, 1, 1)

  for (var i = 0; i < 16; i++) {
    ctx.fillText('Hello world!', -50, -50)
    ctx.rotate(-Math.PI / 8)
  }
}

tests['rotated, scaled and skewed baseline'] = function (ctx) {
  // Known issue: we don't have a way to decompose the cairo matrix into the
  // skew and rotation separately.
  ctx.font = '120px Arial'
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.translate(100, 100)
  ctx.scale(0.1, 0.2)
  ctx.transform(1, 1, 0, 1, 1, 1)

  for (var i = 0; i < 16; i++) {
    ctx.fillText('Hello world!', -50 / 0.1, -50 / 0.2)
    ctx.rotate(-Math.PI / 8)
  }
}

tests['measureText()'] = function (ctx) {
  // Note: As of Sep 2017, Chrome is the only browser with advanced TextMetrics,
  // and they're behind a flag, and a few of them are missing and others are
  // wrong.
  function drawWithBBox (text, x, y) {
    ctx.fillText(text, x, y)
    ctx.strokeStyle = 'red'
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(200, y + 0.5); ctx.stroke()
    var metrics = ctx.measureText(text)
    ctx.strokeStyle = 'blue'
    ctx.strokeRect(
      x - metrics.actualBoundingBoxLeft + 0.5,
      y - metrics.actualBoundingBoxAscent + 0.5,
      metrics.width,
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    )
  }

  ctx.font = '20px Arial'
  ctx.textBaseline = 'alphabetic'
  drawWithBBox('Alphabet alphabetic', 20, 50)

  drawWithBBox('weruoasnm', 50, 175) // no ascenders/descenders

  drawWithBBox(',', 100, 125) // tiny height

  ctx.textBaseline = 'bottom'
  drawWithBBox('Alphabet bottom', 20, 90)

  ctx.textBaseline = 'alphabetic'
  ctx.rotate(Math.PI / 8)
  drawWithBBox('Alphabet', 50, 100)
}

tests['image sampling (#1084)'] = function (ctx, done) {
  let loaded1, loaded2
  const img1 = new Image()
  const img2 = new Image()

  img1.onload = () => {
    loaded1 = true
    ctx.drawImage(img1, -170 - 100, -203, 352, 352)
    if (loaded2) done()
  }

  img1.onerror = done

  img2.onload = () => {
    loaded2 = true
    ctx.drawImage(img2, 182 - 100, -203, 352, 352)
    if (loaded1) done()
  }

  img2.onerror = done

  img1.src = imageSrc('halved-1.jpeg')
  img2.src = imageSrc('halved-2.jpeg')
}

tests['drawImage reflection bug'] = function (ctx, done) {
  var img1 = new Image()
  img1.onload = function () {
    ctx.drawImage(img1, 60, 30, 150, 150, 0, 0, 200, 200)
    done()
  }
  img1.src = imageSrc('chrome.jpg')
}

tests['drawImage reflection bug with skewing'] = function (ctx, done) {
  var img1 = new Image()
  img1.onload = function () {
    ctx.transform(1.2, 1, 1.8, 1.3, 0, 0)
    ctx.drawImage(img1, 60, 30, 150, 150, 0, 0, 200, 200)
    ctx.setTransform(1.2, 1.8, 0.3, 0.8, 0, 0)
    ctx.drawImage(img1, 30, 60, 150, 150, -5, -5, 200, 200)
    done()
  }
  img1.src = imageSrc('chrome.jpg')
}

tests['transformed drawimage'] = function (ctx) {
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 200, 200)
  ctx.fillStyle = 'black'
  ctx.fillRect(5, 5, 50, 50)
  ctx.transform(1.2, 1, 1.8, 1.3, 0, 0)
  ctx.drawImage(ctx.canvas, 0, 0)
}
