'use strict';

/*!
 * Canvas - PDFStream
 */

/**
 * Module dependencies.
 */

var ImageStream = require('./imagestream');
var util = require('util');

/**
 * Initialize a `PDFStream` with the given `canvas`.
 *
 * "data" events are emitted with `Buffer` chunks, once complete the
 * "end" event is emitted. The following example will stream to a file
 * named "./my.pdf".
 *
 *     var out = fs.createWriteStream(__dirname + '/my.pdf')
 *       , stream = canvas.createPDFStream();
 *
 *     stream.pipe(out);
 *
 * @param {Canvas} canvas
 * @param {Boolean} sync
 * @api public
 */

var PDFStream = module.exports = function PDFStream(canvas, sync) {
  if (!(this instanceof PDFStream)) {
    throw new TypeError("Class constructors cannot be invoked without 'new'");
  }

  ImageStream.call(this);

  var self = this
    , method = sync
      ? 'streamPDFSync'
      : 'streamPDF';
  this.sync = sync;
  this.canvas = canvas;

  // TODO: implement async
  if ('streamPDF' == method) method = 'streamPDFSync';
  this.method = method;

  this._stream_method = canvas[method].bind(canvas);
};

util.inherits(PDFStream, ImageStream);

PDFStream.prototype._handle_chunk = function (err, chunk, len) {
  if (err) {
    this.emit('error', err);
  } else if(len) {
    this.push(chunk);
  } else {
    this.push(null);
  }
};
