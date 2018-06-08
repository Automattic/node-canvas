'use strict';

/*!
 * Canvas
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const bindings = require('./bindings')
const Canvas = module.exports = bindings.Canvas
const Context2d = require('./context2d')
const PNGStream = require('./pngstream')
const PDFStream = require('./pdfstream')
const JPEGStream = require('./jpegstream')
const FORMATS = ['image/png', 'image/jpeg']

/**
 * Inspect canvas.
 *
 * @return {String}
 * @api public
 */

Canvas.prototype.inspect = function(){
  return '[Canvas ' + this.width + 'x' + this.height + ']';
};

/**
 * Get a context object.
 *
 * @param {String} contextType must be "2d"
 * @param {Object {alpha: boolean, pixelFormat: PIXEL_FORMAT} } contextAttributes Optional
 * @return {Context2d}
 * @api public
 */

Canvas.prototype.getContext = function (contextType, contextAttributes) {
  if ('2d' == contextType) {
    var ctx = this._context2d || (this._context2d = new Context2d(this, contextAttributes));
    this.context = ctx;
    ctx.canvas = this;
    return ctx;
  }
};

/**
 * Create a `PNGStream` for `this` canvas.
 *
 * @param {Object} [options]
 * @param {number} [options.compressionLevel] Number from 0 to 9 corresponding
 *   to the ZLIB compression level. Defaults to 6.
 * @param {number} [options.filters] Any bitwise combination of
 *   `PNG_FILTER_NONE`, `PNG_FITLER_SUB`, `PNG_FILTER_UP`, `PNG_FILTER_AVG`,
 *   `PNG_FILTER_PATETH`; or one of `PNG_ALL_FILTERS` or `PNG_NO_FILTERS`. These
 *   specify which filters *may* be used by libpng. During encoding, libpng will
 *   select the best filter from this list of allowed filters.
 * @param {Uint8ClampedArray} [options.palette] Provide for indexed PNG
 *   encoding. Entries should be R-G-B-A values.
 * @param {number} [options.backgroundIndex] Optional index of background color
 *   for indexed PNGs. Defaults to 0.
 * @return {PNGStream}
 * @public
 */
Canvas.prototype.pngStream =
Canvas.prototype.createPNGStream = function(options){
  return new PNGStream(this, options);
};

/**
 * Create a `PDFStream` for `this` canvas.
 *
 * @return {PDFStream}
 * @public
 */
Canvas.prototype.pdfStream =
Canvas.prototype.createPDFStream = function(){
  return new PDFStream(this);
};

/**
 * Create a `JPEGStream` for `this` canvas.
 *
 * @param {Object} [options]
 * @param {number} [options.quality] Number from 0 to 1. Defaults to 0.75.
 * @param {boolean|1|2} [options.chromaSubsampling] Enables 2x2 chroma
 *   subsampling. `true` is equivalent to `2`, `false` is equivalent to `1`.
 * @param {boolean} [options.progressive] Enables progressive encoding. Defautls
 *   to false.
 * @return {JPEGStream}
 * @public
 */
Canvas.prototype.jpegStream =
Canvas.prototype.createJPEGStream = function(options){
  return new JPEGStream(this, options);
};

/**
 * Return a data url. Pass a function for async support (required for "image/jpeg").
 *
 * @param {String} type, optional, one of "image/png" or "image/jpeg", defaults to "image/png"
 * @param {Object|Number} encoderOptions, optional, options for jpeg compression (see documentation for Canvas#jpegStream) or the JPEG encoding quality from 0 to 1.
 * @param {Function} fn, optional, callback for asynchronous operation. Required for type "image/jpeg".
 * @return {String} data URL if synchronous (callback omitted)
 * @api public
 */

Canvas.prototype.toDataURL = function(a1, a2, a3){
  // valid arg patterns (args -> [type, opts, fn]):
  // [] -> ['image/png', null, null]
  // [qual] -> ['image/png', null, null]
  // [undefined] -> ['image/png', null, null]
  // ['image/png'] -> ['image/png', null, null]
  // ['image/png', qual] -> ['image/png', null, null]
  // [fn] -> ['image/png', null, fn]
  // [type, fn] -> [type, null, fn]
  // [undefined, fn] -> ['image/png', null, fn]
  // ['image/png', qual, fn] -> ['image/png', null, fn]
  // ['image/jpeg', fn] -> ['image/jpeg', null, fn]
  // ['image/jpeg', opts, fn] -> ['image/jpeg', opts, fn]
  // ['image/jpeg', qual, fn] -> ['image/jpeg', {quality: qual}, fn]
  // ['image/jpeg', undefined, fn] -> ['image/jpeg', null, fn]

  var type = 'image/png';
  var opts = {};
  var fn;

  if ('function' === typeof a1) {
    fn = a1;
  } else {
    if ('string' === typeof a1 && FORMATS.indexOf(a1.toLowerCase()) !== -1) {
      type = a1.toLowerCase();
    }

    if ('function' === typeof a2) {
      fn = a2;
    } else {
      if ('object' === typeof a2) {
        opts = a2;
      } else if ('number' === typeof a2) {
        opts = {quality: Math.max(0, Math.min(1, a2)) * 100};
      }

      if ('function' === typeof a3) {
        fn = a3;
      } else if (undefined !== a3) {
        throw new TypeError(typeof a3 + ' is not a function');
      }
    }
  }

  if (this.width === 0 || this.height === 0) {
    // Per spec, if the bitmap has no pixels, return this string:
    var str = "data:,";
    if (fn) {
      setTimeout(function() {
        fn(null, str);
      });
    }
    return str;
  }

  if ('image/png' === type) {
    if (fn) {
      this.toBuffer(function(err, buf){
        if (err) return fn(err);
        fn(null, 'data:image/png;base64,' + buf.toString('base64'));
      });
    } else {
      return 'data:image/png;base64,' + this.toBuffer().toString('base64');
    }

  } else if ('image/jpeg' === type) {
    if (undefined === fn) {
      throw new Error('Missing required callback function for format "image/jpeg"');
    }

    var stream = this.jpegStream(opts);
    // note that jpegStream is synchronous
    var buffers = [];
    stream.on('data', function (chunk) {
      buffers.push(chunk);
    });
    stream.on('error', function (err) {
      fn(err);
    });
    stream.on('end', function() {
      var result = 'data:image/jpeg;base64,' + Buffer.concat(buffers).toString('base64');
      fn(null, result);
    });
  }
};
