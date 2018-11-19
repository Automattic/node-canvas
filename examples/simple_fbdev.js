#!/usr/bin/env node

/**
* Module dependencies.
*/

const fs = require('fs')
const { join } = require('path')

const { backends: { FBDevBackend }, Canvas } = require('..')

const squareSize = 100

var device = process.argv[2] || '/dev/fb0'

var backend = new FBDevBackend(device)
var canvas = new Canvas(backend)
var ctx = canvas.getContext('2d')

var offsetX = canvas.width - squareSize
var offsetY = canvas.height - squareSize

ctx.fillStyle = '#FF0000'
ctx.fillRect(0, 0, squareSize, squareSize)

ctx.fillStyle = '#00FF00'
ctx.fillRect(offsetX, 0, squareSize, squareSize)

ctx.fillStyle = '#0000FF'
ctx.fillRect(0, offsetY, squareSize, squareSize)

ctx.fillStyle = '#FFFFFF'
ctx.fillRect(offsetX, offsetY, squareSize, squareSize)

console.log('Width: ' + canvas.width + ', Height: ' + canvas.height)

var outPath = join(__dirname, 'rectangle.png')

canvas.createPNGStream().pipe(fs.createWriteStream(outPath))
