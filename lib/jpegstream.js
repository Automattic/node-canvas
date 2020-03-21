'use strict';

/*!
 * Canvas - JPEGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

var Readable = require('stream').Readable;
var util = require('util');

var JPEGStream = module.exports = function JPEGStream(canvas, options) {
  if (!(this instanceof JPEGStream)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'");
  }

  if (canvas.streamJPEGSync === undefined) {
    throw new Error("node-canvas was built without JPEG support.");
  }

  Readable.call(this);

  this.options = options;
  this.canvas = canvas;
};

util.inherits(JPEGStream, Readable);

function noop() {}

JPEGStream.prototype._read = function _read() {
  // For now we're not controlling the c++ code's data emission, so we only
  // call canvas.streamJPEGSync once and let it emit data at will.
  this._read = noop;
  var self = this;
  self.canvas.streamJPEGSync(this.options, function(err, chunk){
    if (err) {
      self.emit('error', err);
    } else if (chunk) {
      self.push(chunk);
    } else {
      self.push(null);
    }
  });
};
