
/*!
 * Canvas - PNGStream
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;

/**
 * Initialize a `PNGStream` with the given `canvas`.
 *
 * @param {Canvas} canvas
 * @api public
 */

var PNGStream = module.exports = function PNGStream(canvas) {
  var self = this;
  this.canvas = canvas;
  process.nextTick(function(){
    canvas.streamPNG(function(chunk, len){
      if (len) {
        self.emit('data', chunk, len);
      } else {
        self.emit('end');
      }
    });
  });
};

/**
 * Inherit from `EventEmitter`.
 */

PNGStream.prototype.__proto__ = EventEmitter.prototype;