
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
  , Context2d = require('./context2d')
  , PNGStream = require('./pngstream')
  , JPEGStream = require('./jpegstream')
  , FontFace = canvas.FontFace
  , fs = require('fs')
  , packageJson = require("../package.json");

/**
 * Export `Canvas` as the module.
 */

var Canvas = exports = module.exports = Canvas;

/**
 * Library version.
 */

exports.version = packageJson.version;

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
exports.Image = Image;
exports.ImageData = canvas.ImageData;

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
    , progressive: options.progressive || false
  });
};

/**
 * Return a data url. Pass a function for async support (required for "image/jpeg").
 *
 * @param {String} type, optional, one of "image/png" or "image/jpeg", defaults to "image/png"
 * @param {Object} opts, optional, options for jpeg compression (see documentation for Canvas#jpegStream)
 * @param {Function} fn, optional, callback for asynchronous operation. Required for type "image/jpeg".
 * @return {String} data URL if synchronous (callback omitted)
 * @api public
 */

Canvas.prototype.toDataURL = function(a1, a2, a3){
  // valid arg patterns (args -> [type, opts, fn]):
  // [] -> ['image/png', null, null]
  // [undefined] -> ['image/png', null, null]
  // ['image/png'] -> ['image/png', null, null]
  // [fn] -> ['image/png', null, fn]
  // [type, fn] -> [type, null, fn]
  // [undefined, fn] -> ['image/png', null, fn]
  // ['image/jpeg', fn] -> ['image/jpeg', null, fn]
  // ['image/jpeg', opts, fn] -> ['image/jpeg', opts, fn]
  // ['image/jpeg', undefined, fn] -> ['image/jpeg', null, fn]

  var type;
  var opts = {};
  var fn;
  var argc = Math.min(arguments.length, 3);

  switch (argc) {
    case 0:
      type = 'image/png';
      break;
    case 1:
      if ('image/png' === a1) {
        type = a1;
      } else if ('function' === typeof a1) {
        type = 'image/png';
        fn = a1;
      } else if ('image/jpeg' === a1) {
        throw new Error('type "image/jpeg" only supports asynchronous operation');
      } else if (undefined === a1) {
        type = 'image/png';
      } else {
        throw new Error('invalid arguments');
      }
      break;
    case 2:
      if (('image/png' === a1 || 'image/jpeg' === a1) && 'function' === typeof a2) {
        type = a1;
        fn = a2;
      } else if (undefined === a1 && 'function' === typeof a2) {
        type = 'image/png';
        fn = a2;
      } else if ('image/jpeg' === a1 && 'object' === typeof a2) {
        throw new Error('type "image/jpeg" only supports asynchronous operation');
      } else if ('image/png' === a1 && 'object' === typeof a2) {
        throw new Error('type "image/png" does not accept an options object');
      } else {
        throw new Error('invalid arguments');
      }
      break;
    case 3:
      if ('image/jpeg' === a1 && 'object' === typeof a2 && 'function' === typeof a3) {
        type = a1;
        opts = a2;
        fn = a3;
      } else if ('image/jpeg' === a1 && undefined === a2 && 'function' === typeof a3) {
        type = a1;
        fn = a3;
      } else {
        throw new Error('invalid arguments');
      }
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
