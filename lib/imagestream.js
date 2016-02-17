'use strict';

/*!
 * Canvas - ImageStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Readable = require('stream').Readable,
    util = require('util');

if (typeof Readable === 'undefined') {
  throw new Error('Node versions <0.10 are no longer supported.');
}

/**
 * A base class for a stream of compressed image data.
 *
 * @api public
 */

var ImageStream = module.exports = function ImageStream() {

  Readable.call(this, {});

  this._started = false;
};

util.inherits(ImageStream, Readable);

function noop() {}

ImageStream.prototype._read = function () {
  // For now we're not controlling the c++ code's data emission, so we only
  // call canvas.streamPNGSync once and let it emit data at will.
  this._read = noop;
  var self = this;

  process.nextTick(function () {
    self._stream_method(self._handle_chunk.bind(self));
  });
};

ImageStream.prototype._stream_method = noop;

ImageStream.prototype._handle_chunk = noop;
