
/*!
 * Canvas - JPEGStream
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Stream = require('stream').Stream;

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
 * @param {Boolean} sync
 * @api public
 */

var JPEGStream = module.exports = function JPEGStream(canvas, options, sync) {
  var self = this
    , method = sync
      ? 'streamJPEGSync'
      : 'streamJPEG';
  this.options = options;
  this.sync = sync;
  this.canvas = canvas;
  this.readable = true;
  // TODO: implement async
  if ('streamJPEG' == method) method = 'streamJPEGSync';
  process.nextTick(function(){
    canvas[method](options.bufsize, options.quality, options.progressive, function(err, chunk, len){
      if (err) {
        self.emit('error', err);
        self.readable = false;
      } else if (len) {
        self.emit('data', chunk, len);
      } else {
        self.emit('end');
        self.readable = false;
      }
    });
  });
};

/**
 * Inherit from `EventEmitter`.
 */

JPEGStream.prototype.__proto__ = Stream.prototype;
