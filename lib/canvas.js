
/*!
 * Canvas
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = require('../build/default/canvas')
  , Canvas = canvas.Canvas
  , cairoVersion = canvas.cairoVersion
  , Context2d = require('./context2d')
  , PNGStream = require('./pngstream')
  , fs = require('fs');

/**
 * Export `Canvas` as the module.
 */

var Canvas = exports = module.exports = Canvas;

/**
 * Library version.
 */

exports.version = '0.0.2';

/**
 * Cairo version.
 */

exports.cairoVersion = cairoVersion;

/**
 * Expose constructors.
 */

exports.Context2d = Context2d;
exports.PNGStream = PNGStream;

/**
 * Context2d implementation.
 */

require('./context2d');

/**
 * Inspect canvas.
 *
 * @return {String}
 * @api public
 */

Canvas.prototype.inspect = function(){
  return '[Canvas ' + this.width + ' ' + this.height + ']';
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
    var ctx = new Context2d(this);
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

Canvas.prototype.createPNGStream = function(){
  return new PNGStream(this);
};

/**
 * Create a synchronous `PNGStream` for `this` canvas.
 *
 * @return {PNGStream}
 * @api public
 */

Canvas.prototype.createSyncPNGStream = function(){
  return new PNGStream(this, true);
};

/**
 * Return a data url.
 *
 * @param {String} type
 * @return {String}
 * @api public
 */

Canvas.prototype.toDataURL = function(type){
  // TODO: jpeg / svg / pdf :)
  type = type || 'image/png';
  if ('image/png' != type) throw new Error('currently only image/png is supported');
  return 'data:' + type
    + ';base64,' + this.toBuffer().toString('base64');
};
