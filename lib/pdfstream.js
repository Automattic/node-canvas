'use strict';

/*!
 * Canvas - PDFStream
 */

/**
 * Module dependencies.
 */

var Readable = require('stream').Readable;
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

  Readable.call(this);

  var self = this
    , method = sync
      ? 'streamPDFSync'
      : 'streamPDF';
  this.sync = sync;
  this.canvas = canvas;

  // TODO: implement async
  if ('streamPDF' == method) method = 'streamPDFSync';
  this.method = method;
};

util.inherits(PDFStream, Readable);

function noop() {}

PDFStream.prototype._read = function _read() {
  // For now we're not controlling the c++ code's data emission, so we only
  // call canvas.streamPDFSync once and let it emit data at will.
  this._read = noop;
  var self = this;
  process.nextTick(function(){
    self.canvas[self.method](function(err, chunk, len){
      if (err) {
        self.emit('error', err);
      } else if (len) {
        self.push(chunk);
      } else {
        self.push(null);
      }
    });
  });
};
