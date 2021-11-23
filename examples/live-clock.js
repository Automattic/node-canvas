const http = require('http')
const Canvas = require('..')

const clock = require('./clock')

const canvas = Canvas.createCanvas(320, 320)
const ctx = canvas.getContext('2d')

http.createServer(function (req, res) {
  clock(ctx)

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(
    '<meta http-equiv="refresh" content="1;" />' +
    '<img src="' + canvas.toDataURL() + '" />'
  )
}).listen(3000, function () {
  console.log('Server started on port 3000')
})
