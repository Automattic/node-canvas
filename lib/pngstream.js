'use strict';

/*!
 * Canvas - PNGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var ImageStream = require('./imagestream');
var util = require('util');

/**
 * Initialize a `PNGStream` with the given `canvas`.
 *
 * "data" events are emitted with `Buffer` chunks, once complete the
 * "end" event is emitted. The following example will stream to a file
 * named "./my.png".
 *
 *     var out = fs.createWriteStream(__dirname + '/my.png')
 *       , stream = canvas.createPNGStream();
 *
 *     stream.pipe(out);
 *
 * @param {Canvas} canvas
 * @param {Boolean} sync
 * @api public
 */

var PNGStream = module.exports = function PNGStream(canvas, sync) {
  if (!(this instanceof PNGStream)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'");
  }

  ImageStream.call(this);

  var self = this;
  var method = sync
      ? 'streamPNGSync'
      : 'streamPNG';
  this.sync = sync;
  this.canvas = canvas;

  // TODO: implement async
  if ('streamPNG' === method) method = 'streamPNGSync';
  this.method = method;

  this._stream_method = canvas[method].bind(canvas);
};

util.inherits(PNGStream, ImageStream);

PNGStream.prototype._handle_chunk = function (err, chunk, len) {
  if (err) {
    this.emit('error', err);
  } else if(len) {
    this.push(chunk);
  } else {
    this.push(null);
  }
};
