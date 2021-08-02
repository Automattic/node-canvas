const path = require('path')
const express = require('express')

const Canvas = require('../')
const tests = require('./public/tests')

const app = express()
const port = parseInt(process.argv[2] || '4000', 10)

function renderTest (canvas, name, cb) {
  if (!tests[name]) {
    throw new Error('Unknown test: ' + name)
  }

  const ctx = canvas.getContext('2d', { pixelFormat: 'RGBA32' })
  const initialFillStyle = ctx.fillStyle
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 200, 200)
  ctx.fillStyle = initialFillStyle
  if (tests[name].length === 2) {
    tests[name](ctx, cb)
  } else {
    tests[name](ctx)
    cb(null)
  }
}

app.use(express.static(path.join(__dirname, 'fixtures')))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'app.html'))
})

app.get('/pixelmatch.js', function (req, res) {
  res.sendFile(path.join(__dirname, '../node_modules/pixelmatch/', 'index.js'))
})

app.get('/render', function (req, res, next) {
  const canvas = Canvas.createCanvas(200, 200)

  renderTest(canvas, req.query.name, function (err) {
    if (err) return next(err)

    res.writeHead(200, { 'Content-Type': 'image/png' })
    canvas.pngStream().pipe(res)
  })
})

app.get('/pdf', function (req, res, next) {
  const canvas = Canvas.createCanvas(200, 200, 'pdf')

  renderTest(canvas, req.query.name, function (err) {
    if (err) return next(err)

    res.writeHead(200, { 'Content-Type': 'application/pdf' })
    canvas.pdfStream().pipe(res)
  })
})

app.listen(port, function () {
  console.log('👉  http://localhost:%d/', port)
})
