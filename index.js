const Canvas = require('./lib/canvas')
const parseFont = require('./lib/parse-font')

exports.parseFont = parseFont

exports.createCanvas = function (width, height, type) {
  return new Canvas(width, height, type)
}

exports.createImageData = function (array, width, height) {
  return new Canvas.ImageData(array, width, height)
}

exports.loadImage = function (src) {
  return new Promise((resolve, reject) => {
    const image = new Canvas.Image()

    function cleanup () {
      image.onload = null
      image.onerror = null
    }

    image.onload = () => { cleanup(); resolve(image) }
    image.onerror = (err) => { cleanup(); reject(err) }

    image.src = src
  })
}
