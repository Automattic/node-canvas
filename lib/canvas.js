
/*!
 * Canvas
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = require('./bindings')
  , Canvas = canvas.Canvas
  , Image = canvas.Image
  , cairoVersion = canvas.cairoVersion
  , PixelArray = canvas.PixelArray
  , Context2d = require('./context2d')
  , PNGStream = require('./pngstream')
  , JPEGStream = require('./jpegstream')
  , FontFace = canvas.FontFace
  , fs = require('fs');

/**
 * Export `Canvas` as the module.
 */

var Canvas = exports = module.exports = Canvas;

/**
 * Library version.
 */

exports.version = '1.0.0';

/**
 * Cairo version.
 */

exports.cairoVersion = cairoVersion;

/**
 * jpeglib version.
 */

if (canvas.jpegVersion) {
  exports.jpegVersion = canvas.jpegVersion;
}

/**
 * gif_lib version.
 */

if (canvas.gifVersion) {
  exports.gifVersion = canvas.gifVersion.replace(/[^.\d]/g, '');
}

/**
 * Expose constructors.
 */

exports.Context2d = Context2d;
exports.PNGStream = PNGStream;
exports.JPEGStream = JPEGStream;
exports.PixelArray = PixelArray;
exports.Image = Image;

if (FontFace) {
  function Font(name, path, idx) {
    this.name = name;
    this._faces = {};

    this.addFace(path, 'normal', 'normal', idx);
  };

  Font.prototype.addFace = function(path, weight, style, idx) {
    style = style || 'normal';
    weight = weight || 'normal';

    var face = new FontFace(path, idx || 0);
    this._faces[weight + '-' + style] = face;
  };

  Font.prototype.getFace = function(weightStyle) {
    return this._faces[weightStyle] || this._faces['normal-normal'];
  };

  exports.Font = Font;
}

/**
 * Context2d implementation.
 */

require('./context2d');

/**
 * Image implementation.
 */

require('./image');

/**
 * PixelArray implementation.
 */

require('./pixelarray');

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
 * @param {String} contextId
 * @return {Context2d}
 * @api public
 */

Canvas.prototype.getContext = function(contextId){
  if ('2d' == contextId) {
    var ctx = this._context2d || (this._context2d = new Context2d(this));
    this.context = ctx;
    ctx.canvas = this;
    return ctx;
  }
};

/**
 * Create a `PNGStream` for `this` canvas.
 *
 * @return {PNGStream}
 * @api public
 */

Canvas.prototype.pngStream =
Canvas.prototype.createPNGStream = function(){
  return new PNGStream(this);
};

/**
 * Create a synchronous `PNGStream` for `this` canvas.
 *
 * @return {PNGStream}
 * @api public
 */

Canvas.prototype.syncPNGStream =
Canvas.prototype.createSyncPNGStream = function(){
  return new PNGStream(this, true);
};

/**
 * Create a `JPEGStream` for `this` canvas.
 *
 * @param {Object} options
 * @return {JPEGStream}
 * @api public
 */

Canvas.prototype.jpegStream =
Canvas.prototype.createJPEGStream = function(options){
  return this.createSyncJPEGStream(options);
};

/**
 * Create a synchronous `JPEGStream` for `this` canvas.
 *
 * @param {Object} options
 * @return {JPEGStream}
 * @api public
 */

Canvas.prototype.syncJPEGStream =
Canvas.prototype.createSyncJPEGStream = function(options){
  options = options || {};
  return new JPEGStream(this, {
      bufsize: options.bufsize || 4096
    , quality: options.quality || 75
  });
};

/**
 * Return a data url. Pass a function for async support.
 *
 * @param {String|Function} type
 * @param {Function} fn
 * @return {String}
 * @api public
 */

Canvas.prototype.toDataURL = function(type, fn){
  // Default to png
  type = type || 'image/png';

  // Allow callback as first arg
  if ('function' == typeof type) fn = type, type = 'image/png';

  // Throw on non-png
  if ('image/png' != type) throw new Error('currently only image/png is supported');

  var prefix = 'data:' + type + ';base64,';

  if (fn) {
    this.toBuffer(function(err, buf){
      if (err) return fn(err);
      var str = 'data:' + type
      fn(null, prefix + buf.toString('base64'));
    });
  } else {
    return prefix + this.toBuffer().toString('base64');
  }
};
