'use strict';

/*!
 * Canvas - PDFStream
 */

var Readable = require('stream').Readable;
var util = require('util');

var PDFStream = module.exports = function PDFStream(canvas, options) {
  if (!(this instanceof PDFStream)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'");
  }

  Readable.call(this);

  this.canvas = canvas;
  this.options = options;
};

util.inherits(PDFStream, Readable);

function noop() {}

PDFStream.prototype._read = function _read() {
  // For now we're not controlling the c++ code's data emission, so we only
  // call canvas.streamPDFSync once and let it emit data at will.
  this._read = noop;
  var self = this;
  self.canvas.streamPDFSync(function(err, chunk, len){
    if (err) {
      self.emit('error', err);
    } else if (len) {
      self.push(chunk);
    } else {
      self.push(null);
    }
  }, this.options);
};
