const fs = require('fs')
const path = require('path')
const Canvas = require('..')

const canvas = Canvas.createCanvas(40, 15)
const ctx = canvas.getContext('2d')

function spark (ctx, data) {
  const len = data.length
  const pad = 1
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  const barWidth = width / len
  const max = Math.max.apply(null, data)

  ctx.fillStyle = 'rgba(0,0,255,0.5)'
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 1

  data.forEach(function (n, i) {
    const x = i * barWidth + pad
    const y = height * (n / max)

    ctx.lineTo(x, height - y)
    ctx.fillRect(x, height, barWidth - pad, -y)
  })

  ctx.stroke()
}

spark(ctx, [1, 2, 4, 5, 10, 4, 2, 5, 4, 3, 3, 2])

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'spark.png')))
