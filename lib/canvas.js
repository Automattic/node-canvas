
/*!
 * Canvas
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = require('../build/default/canvas')
  , colors = require('./colors')
  , Canvas = canvas.Canvas
  , Context2d = canvas.Context2d
  , CanvasGradient = canvas.CanvasGradient
  , cairoVersion = canvas.cairoVersion;

/**
 * Export `Canvas` as the module.
 */

var Canvas = exports = module.exports = Canvas;

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Cairo version.
 */

exports.cairoVersion = cairoVersion;

/**
 * Parse the given color `str`.
 *
 * Current supports:
 *
 *  - #nnn
 *  - #nnnnnn
 *  - rgb(r,g,b)
 *  - rgba(r,g,b,a)
 *  - color
 *
 * Examples
 *
 *  - #fff
 *  - #FFF
 *  - #FFFFFF
 *  - rgb(255,255,5)
 *  - rgba(255,255,5,.8)
 *  - rgba(255,255,5,0.8)
 *  - white
 *  - red
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

exports.parseColor = function(str){
  str = colors[str] || String(str);
  if (0 == str.indexOf('rgba')) {
    var captures = /rgba\((\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *, *(\d+\.\d+|\.\d+|\d+) *\)/.exec(str);
    if (!captures) return;
    return [
        parseInt(captures[1], 10)
      , parseInt(captures[2], 10)
      , parseInt(captures[3], 10)
      , parseFloat(captures[4], 10)
    ];
  } else if (0 == str.indexOf('rgb')) {
    var captures = /rgb\((\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *\)/.exec(str);
    if (!captures) return;
    return [
        parseInt(captures[1], 10)
      , parseInt(captures[2], 10)
      , parseInt(captures[3], 10)
      , 1
    ];
  } else if ('#' == str.charAt(0) && str.length > 4) {
    var captures = /#(\w{2})(\w{2})(\w{2})/.exec(str);
    if (!captures) return;
    return [
        parseInt(captures[1], 16)
      , parseInt(captures[2], 16)
      , parseInt(captures[3], 16)
      , 1
    ];
  } else if ('#' == str.charAt(0)) {
    var captures = /#(\w)(\w)(\w)/.exec(str);
    if (!captures) return;
    return [
        parseInt(captures[1] + captures[1], 16)
      , parseInt(captures[2] + captures[2], 16)
      , parseInt(captures[3] + captures[3], 16)
      , 1
    ];
  }
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

CanvasGradient.prototype.addColorStop = function(offset, color){
  var rgba = exports.parseColor(color) || [0,0,0,1];
  this.addColorStopRGBA(
      offset
    , rgba[0]
    , rgba[1]
    , rgba[2]
    , rgba[3]);
};

Context2d.prototype.createLinearGradient = function(x0, y0, x1, y1){
  return new CanvasGradient(x0, y0, x1, y1);
};

Context2d.prototype.createRadialGradient = function(x0, y0, r0, x1, y1, r1){
  return new CanvasGradient(x0, y0, r0, x1, y1, r1);
};

/**
 * Set the fill style with the given css color string.
 *
 * @see exports.parseColor()
 * @api public
 */

Context2d.prototype.__defineSetter__('fillStyle', function(val){
  var rgba = exports.parseColor(val) || [0,0,0,1];
  this.lastFillStyle = rgba;
  this.setFillRGBA(
      rgba[0]
    , rgba[1]
    , rgba[2]
    , rgba[3]);
});

/**
 * Get the current fill style string.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('fillStyle', function(){
  var rgba = this.lastFillStyle;
  return 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + rgba[3] + ')';
});

/**
 * Set the stroke style with the given css color string.
 *
 * @see exports.parseColor()
 * @api public
 */

Context2d.prototype.__defineSetter__('strokeStyle', function(val){
  var rgba = exports.parseColor(val) || [0,0,0,1];
  this.lastStrokeStyle = rgba;
  this.setStrokeRGBA(
      rgba[0]
    , rgba[1]
    , rgba[2]
    , rgba[3]);
});

/**
 * Get the current stroke style string.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('strokeStyle', function(){
  var rgba = this.lastStrokeStyle;
  return 'rgba(' + rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ',' + rgba[3] + ')';
});