var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var canvas = new Canvas(150, 150)
var ctx = canvas.getContext('2d')

ctx.fillRect(0, 0, 150, 150)   // Draw a rectangle with default settings
ctx.save()                     // Save the default state

ctx.fillStyle = '#09F'         // Make changes to the settings
ctx.fillRect(15, 15, 120, 120) // Draw a rectangle with new settings

ctx.save()                     // Save the current state
ctx.fillStyle = '#FFF'         // Make changes to the settings
ctx.globalAlpha = 0.5
ctx.fillRect(30, 30, 90, 90)   // Draw a rectangle with new settings

ctx.restore()                  // Restore previous state
ctx.fillRect(45, 45, 60, 60)   // Draw a rectangle with restored settings

ctx.restore()                  // Restore original state
ctx.fillRect(60, 60, 30, 30)   // Draw a rectangle with restored settings

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'state.png')))
