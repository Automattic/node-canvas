var Canvas = require('..')
var framebuffer = new Canvas.backends.FramebufferBackend("/dev/fb0");

var canvas = new Canvas.Canvas(framebuffer)
var ctx = canvas.getContext('2d')

console.log('Width: ' + canvas.width + ', Height: ' + canvas.height)

ctx.fillStyle = '#00FF00'
ctx.fillRect(50, 50, 100, 100)
