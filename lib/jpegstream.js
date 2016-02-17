'use strict';

/*!
 * Canvas - JPEGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var ImageStream = require('./imagestream');
var util = require('util');

/**
 * Initialize a `JPEGStream` with the given `canvas`.
 *
 * "data" events are emitted with `Buffer` chunks, once complete the
 * "end" event is emitted. The following example will stream to a file
 * named "./my.jpeg".
 *
 *     var out = fs.createWriteStream(__dirname + '/my.jpeg')
 *       , stream = canvas.createJPEGStream();
 *
 *     stream.pipe(out);
 *
 * @param {Canvas} canvas
 * @param {Object} options options passed to the JPEG encoder.
 * @param {Boolean} sync
 * @api public
 */

var JPEGStream = module.exports = function JPEGStream(canvas, options, sync) {
  if (!(this instanceof JPEGStream)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'");
  }

  ImageStream.call(this);

  var self = this;
  var method = sync
      ? 'streamJPEGSync'
      : 'streamJPEG';
  this.options = options;
  this.sync = sync;
  this.canvas = canvas;

  // TODO: implement async
  if ('streamJPEG' == method) method = 'streamJPEGSync';
  this.method = method;
  this._stream_method = canvas[method].bind(canvas, options.bufsize, options.quality, options.progressive);
};

util.inherits(JPEGStream, ImageStream);

JPEGStream.prototype._handle_chunk = function (err, chunk) {
  if (err) {
    this.emit('error', err);
  } else if(chunk) {
    this.push(chunk);
  } else {
    this.push(null);
  }
};
