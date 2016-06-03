var fs = require('fs')
var path = require('path')
var Canvas = require('..')

var Image = Canvas.Image
var canvas = new Canvas(400, 267)
var ctx = canvas.getContext('2d')

var img = new Image()

img.onload = function () {
  ctx.drawImage(img, 0, 0)
}

img.src = path.join(__dirname, 'images', 'squid.png')

var sigma = 10 // radius
var kernel, kernelSize, kernelSum

function buildKernel () {
  var i, j, g
  var ss = sigma * sigma
  var factor = 2 * Math.PI * ss

  kernel = [[]]

  i = 0
  do {
    g = Math.exp(-(i * i) / (2 * ss)) / factor
    if (g < 1e-3) break
    kernel[0].push(g)
    ++i
  } while (i < 7)

  kernelSize = i
  for (j = 1; j < kernelSize; ++j) {
    kernel.push([])
    for (i = 0; i < kernelSize; ++i) {
      g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor
      kernel[j].push(g)
    }
  }

  kernelSum = 0
  for (j = 1 - kernelSize; j < kernelSize; ++j) {
    for (i = 1 - kernelSize; i < kernelSize; ++i) {
      kernelSum += kernel[Math.abs(j)][Math.abs(i)]
    }
  }
}

function blurTest () {
  var x, y, i, j
  var r, g, b, a

  console.log('... running')

  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  var data = imgData.data
  var width = imgData.width
  var height = imgData.height

  var startTime = (new Date()).getTime()

  for (y = 0; y < height; ++y) {
    for (x = 0; x < width; ++x) {
      r = 0
      g = 0
      b = 0
      a = 0

      for (j = 1 - kernelSize; j < kernelSize; ++j) {
        if (y + j < 0 || y + j >= height) continue

        for (i = 1 - kernelSize; i < kernelSize; ++i) {
          if (x + i < 0 || x + i >= width) continue

          r += data[4 * ((y + j) * width + (x + i)) + 0] * kernel[Math.abs(j)][Math.abs(i)]
          g += data[4 * ((y + j) * width + (x + i)) + 1] * kernel[Math.abs(j)][Math.abs(i)]
          b += data[4 * ((y + j) * width + (x + i)) + 2] * kernel[Math.abs(j)][Math.abs(i)]
          a += data[4 * ((y + j) * width + (x + i)) + 3] * kernel[Math.abs(j)][Math.abs(i)]
        }
      }

      data[4 * (y * width + x) + 0] = r / kernelSum
      data[4 * (y * width + x) + 1] = g / kernelSum
      data[4 * (y * width + x) + 2] = b / kernelSum
      data[4 * (y * width + x) + 3] = a / kernelSum
    }
  }

  var finishTime = Date.now() - startTime
  for (i = 0; i < data.length; i++) {
    imgData.data[i] = data[i]
  }

  ctx.putImageData(imgData, 0, 0)
  console.log('... finished in %dms', finishTime)
}

buildKernel()
blurTest()

canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'kraken.png')))
