'use strict'

const bindings = require('../build/Release/canvas.node')

module.exports = bindings

bindings.ImageData.prototype.toString = function () {
	return '[object ImageData]'
}

bindings.CanvasGradient.prototype.toString = function () {
	return '[object CanvasGradient]'
}
