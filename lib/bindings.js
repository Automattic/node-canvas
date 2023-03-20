'use strict'

const bindings = require('../build/Release/canvas.node')

module.exports = bindings

Object.defineProperty(bindings.Canvas.prototype, Symbol.toStringTag, {
  value: 'HTMLCanvasElement'
})

Object.defineProperty(bindings.Image.prototype, Symbol.toStringTag, {
  value: 'HTMLImageElement'
})

bindings.ImageData.prototype.toString = function () {
	return '[object ImageData]'
}

Object.defineProperty(bindings.ImageData.prototype, Symbol.toStringTag, {
  value: 'ImageData'
})

bindings.CanvasGradient.prototype.toString = function () {
	return '[object CanvasGradient]'
}

Object.defineProperty(bindings.CanvasGradient.prototype, Symbol.toStringTag, {
  value: 'CanvasGradient'
})

Object.defineProperty(bindings.CanvasPattern.prototype, Symbol.toStringTag, {
  value: 'CanvasPattern'
})

Object.defineProperty(bindings.CanvasRenderingContext2d.prototype, Symbol.toStringTag, {
  value: 'CanvasRenderingContext2d'
})
