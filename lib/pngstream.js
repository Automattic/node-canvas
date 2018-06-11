'use strict';

/*!
 * Canvas - PNGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Readable = require('stream').Readable;
var util = require('util');

/**
 * @param {Canvas} canvas
 * @param {Object} options
 * @private
 */
var PNGStream = module.exports = function PNGStream(canvas, options) {
  if (!(this instanceof PNGStream)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'");
  }

  Readable.call(this);

  if (options &&
    options.palette instanceof Uint8ClampedArray &&
    options.palette.length % 4 !== 0) {
    throw new Error("Palette length must be a multiple of 4.");
  }
  this.canvas = canvas;
  this.options = options || {};
};

util.inherits(PNGStream, Readable);

function noop() {}

PNGStream.prototype._read = function _read() {
  // For now we're not controlling the c++ code's data emission, so we only
  // call canvas.streamPNGSync once and let it emit data at will.
  this._read = noop;
  var self = this;
  self.canvas.streamPNGSync(function(err, chunk, len){
    if (err) {
      self.emit('error', err);
    } else if (len) {
      self.push(chunk);
    } else {
      self.push(null);
    }
  }, self.options);
};
