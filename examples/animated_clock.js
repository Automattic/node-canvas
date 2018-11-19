var Canvas = require('..')

// var backend = new Canvas.backends.FBDevBackend("/dev/fb0");
var backend = new Canvas.backends.X11Backend(800, 600)

var canvas = new Canvas(backend)
var ctx = canvas.getContext('2d')

function getX (angle) {
  return -Math.sin(angle + Math.PI)
}

function getY (angle) {
  return Math.cos(angle + Math.PI)
}

function clock (ctx) {
  var now = new Date()
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.beginPath()
  ctx.lineWidth = 14
  ctx.strokeStyle = '#325FA2'
  ctx.fillStyle = '#eeeeee'
  ctx.arc(0, 0, 142, 0, Math.PI * 2, true)
  ctx.stroke()
  ctx.fill()

  ctx.strokeStyle = '#000000'
  // Hour marks
  ctx.lineWidth = 8
  for (var i = 0; i < 12; i++) {
    const x = getX(Math.PI / 6 * i)
    const y = getY(Math.PI / 6 * i)
    ctx.beginPath()
    ctx.moveTo(x * 100, y * 100)
    ctx.lineTo(x * 125, y * 125)
    ctx.stroke()
  }

  // Minute marks
  ctx.lineWidth = 5
  for (i = 0; i < 60; i++) {
    if (i % 5) {
      const x = getX(Math.PI / 30 * i)
      const y = getY(Math.PI / 30 * i)
      ctx.beginPath()
      ctx.moveTo(x * 117, y * 117)
      ctx.lineTo(x * 125, y * 125)
      ctx.stroke()
    }
  }

  var sec = now.getSeconds()
  var min = now.getMinutes()
  var hr = now.getHours()
  hr = hr >= 12 ? hr - 12 : hr

  ctx.fillStyle = 'black'

  // write Hours
  {
    const x = getX(hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec)
    const y = getY(hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec)
    ctx.lineWidth = 14
    ctx.beginPath()
    ctx.moveTo(x * -20, y * -20)
    ctx.lineTo(x * 80, y * 80)
    ctx.stroke()
  }

  // write Minutes
  {
    const x = getX((Math.PI / 30) * min + (Math.PI / 1800) * sec)
    const y = getY((Math.PI / 30) * min + (Math.PI / 1800) * sec)

    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(x * -28, y * -28)
    ctx.lineTo(x * 112, y * 112)
    ctx.stroke()
  }

  // Write seconds
  var x = getX(sec * Math.PI / 30)
  var y = getY(sec * Math.PI / 30)
  ctx.strokeStyle = '#D40000'
  ctx.fillStyle = '#D40000'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(x * -30, y * -30)
  ctx.lineTo(x * 83, y * 83)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 10, 0, Math.PI * 2, true)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x * 95, y * 95, 10, 0, Math.PI * 2, true)
  ctx.stroke()
  ctx.fillStyle = '#555'
  ctx.arc(0, 0, 3, 0, Math.PI * 2, true)
  ctx.fill()

  ctx.restore()
}

setInterval(function () {
  clock(ctx)
}, 1000)
