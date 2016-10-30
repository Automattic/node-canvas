var path = require('path')
var express = require('express')

var Canvas = require('../')
var tests = require('./public/tests')

var app = express()
var port = parseInt(process.argv[2] || '4000', 10)

function renderTest (canvas, name, cb) {
  if (!tests[name]) {
    throw new Error('Unknown test: ' + name)
  }

  if (tests[name].length === 2) {
    tests[name](canvas.getContext('2d'), cb)
  } else {
    tests[name](canvas.getContext('2d'))
    cb(null)
  }
}

app.use(express.static(path.join(__dirname, 'fixtures')))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'app.html'))
})

app.get('/render', function (req, res, next) {
  var canvas = new Canvas(200, 200)

  renderTest(canvas, req.query.name, function (err) {
    if (err) return next(err)

    res.writeHead(200, { 'Content-Type': 'image/png' })
    canvas.pngStream().pipe(res)
  })
})

app.get('/pdf', function (req, res, next) {
  var canvas = new Canvas(200, 200, 'pdf')

  renderTest(canvas, req.query.name, function (err) {
    if (err) return next(err)

    res.writeHead(200, { 'Content-Type': 'application/pdf' })
    canvas.pdfStream().pipe(res)
  })
})

app.listen(port, function () {
  console.log('👉  http://localhost:%d/', port)
})
