var Canvas = require('..')
// Add true after the framebuffer path to enable double buffering.
var framebuffer = new Canvas.backends.FramebufferBackend("/dev/fb0", true);

var canvas = new Canvas.Canvas(framebuffer)
var ctx = canvas.getContext('2d')

console.log('Width: ' + canvas.width + ', Height: ' + canvas.height)

ctx.fillStyle = '#00FF00'
ctx.fillRect(50, 50, 100, 100)

// When double buffering, call blit to write the cache to the screen.
framebuffer.blit();
