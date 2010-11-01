
/*!
 * Canvas
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = require('../build/default/canvas')
  , colors = require('./colors')
  , Canvas = canvas.Canvas
  , Context2d = canvas.CanvasRenderingContext2d
  , CanvasGradient = canvas.CanvasGradient
  , cairoVersion = canvas.cairoVersion
  , PNGStream = require('./pngstream');

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
 * Cache color string RGBA values.
 */

var cache = {};

/**
 * Font RegExp helpers.
 */

var weights = 'normal|bold|bolder|lighter|[1-9](?:00)'
  , styles = 'normal|italic|oblique'
  , units = 'px|pt|pc|in|cm|mm|%'
  , string = '"([^"]+)"|[\\w-]+';

/**
 * Font parser RegExp;
 */

var font = new RegExp('^ *'
  + '(?:(' + weights + ') *)?'
  + '(?:(' + styles + ') *)?'
  + '(\\d+)(' + units + ') *'
  + '((?:' + string + ')( *, *(?:' + string + '))*)'
  );

/**
 * Buffer extensions.
 */

require('./buffer');

/**
 * Return a function used to normalize an RGBA color `prop`.
 *
 * @param {String} prop
 * @return {Function}
 * @api public
 */

function normalizedColor(prop) {
  return function(){
    var rgba = this[prop];
    if (1 == rgba[3]) {
      return '#'
        + rgba[0].toString(16)
        + rgba[1].toString(16)
        + rgba[2].toString(16);
    } else {
      return 'rgba('
        + rgba[0] + ', '
        + rgba[1] + ', '
        + rgba[2] + ', '
        + rgba[3] + ')';
    }
  }
}

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

var parseFont = exports.parseFont = function(str){
  if (cache[str]) return cache[str];
  var obj = {}
    , captures = font.exec(str);
  if (!captures) return;
  obj.weight = captures[1] || 'normal';
  obj.style = captures[2] || 'normal';
  obj.size = parseInt(captures[3], 10);
  obj.unit = captures[4];
  obj.family = captures[5];
  return cache[str] = obj;
};

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

var parseColor = exports.parseColor = function(str){
  if (cache[str]) return cache[str];
  str = colors[str] || String(str);
  // RGBA
  if (0 == str.indexOf('rgba')) {
    var captures = /rgba\((\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *, *(\d+\.\d+|\.\d+|\d+) *\)/.exec(str);
    if (!captures) return;
    return cache[str] = [
        parseInt(captures[1], 10)
      , parseInt(captures[2], 10)
      , parseInt(captures[3], 10)
      , parseFloat(captures[4], 10)
    ];
  // RGB
  } else if (0 == str.indexOf('rgb')) {
    var captures = /rgb\((\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *\)/.exec(str);
    if (!captures) return;
    return cache[str] = [
        parseInt(captures[1], 10)
      , parseInt(captures[2], 10)
      , parseInt(captures[3], 10)
      , 1
    ];
  // #RRGGBB
  } else if ('#' == str[0] && str.length > 4) {
    var captures = /#([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})/.exec(str);
    if (!captures) return;
    return cache[str] = [
        parseInt(captures[1], 16)
      , parseInt(captures[2], 16)
      , parseInt(captures[3], 16)
      , 1
    ];
  // #RGB
  } else if ('#' == str[0]) {
    var captures = /#([a-fA-F\d])([a-fA-F\d])([a-fA-F\d])/.exec(str);
    if (!captures) return;
    return cache[str] = [
        parseInt(captures[1] + captures[1], 16)
      , parseInt(captures[2] + captures[2], 16)
      , parseInt(captures[3] + captures[3], 16)
      , 1
    ];
  }
};

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
 * Return a `Buffer` instance consisting of the PNG image data.
 *
 * @return {Buffer}
 * @api public
 */

Canvas.prototype.toBuffer = function(){
  var buf;
  this.streamPNGSync(function(err, chunk, len){
    if (err) throw err;
    if (len) {
      buf = buf
        ? buf.concat(chunk)
        : chunk;
    }
  });
  return buf;
};

/**
 * Return a data url.
 *
 * @param {String} type
 * @return {String}
 * @api public
 */

Canvas.prototype.toDataURL = function(type){
  // TODO: jpeg / svg
  type = type || 'image/png';
  if ('image/png' != type) throw new Error('currently only image/png is supported');
  return 'data:' + type
    + ';base64,' + this.toBuffer().toString('base64');
};

/**
 * Add `color` stop at the given `offset`.
 *
 * @param {Number} offset
 * @param {String} color
 * @api public
 */

CanvasGradient.prototype.addColorStop = function(offset, color){
  var rgba;
  if (rgba = parseColor(color)) {
    this.addColorStopRGBA(
        offset
      , rgba[0]
      , rgba[1]
      , rgba[2]
      , rgba[3]);
  }
};

/**
 * Create a linear gradient at the given point `(x0, y0)` and `(x1, y1)`.
 *
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} x1
 * @param {Number} y1
 * @return {CanvasGradient}
 * @api public
 */

Context2d.prototype.createLinearGradient = function(x0, y0, x1, y1){
  return new CanvasGradient(x0, y0, x1, y1);
};

/**
 * Create a radial gradient at the given point `(x0, y0)` and `(x1, y1)`
 * and radius `r0` and `r1`.
 *
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} r0
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} r1
 * @return {CanvasGradient}
 * @api public
 */

Context2d.prototype.createRadialGradient = function(x0, y0, r0, x1, y1, r1){
  return new CanvasGradient(x0, y0, r0, x1, y1, r1);
};

/**
 * Reset transform matrix to identity, then apply the given args.
 *
 * @param {...}
 * @api public
 */

Context2d.prototype.setTransform = function(){
  this.resetTransform();
  this.transform.apply(this, arguments);
};

/**
 * Set the fill style with the given css color string.
 *
 * @see exports.parseColor()
 * @api public
 */

Context2d.prototype.__defineSetter__('fillStyle', function(val){
  if (val instanceof CanvasGradient) {
    this.setFillPattern(val);
  } else if ('string' == typeof val) {
    var rgba;
    if (rgba = parseColor(val)) {
      this.lastFillStyle = rgba;
      this.setFillRGBA(
          rgba[0]
        , rgba[1]
        , rgba[2]
        , rgba[3]);
    }
  }
});

/**
 * Get the current fill style string.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('fillStyle', normalizedColor('lastFillStyle'));

/**
 * Set the stroke style with the given css color string.
 *
 * @see exports.parseColor()
 * @api public
 */

Context2d.prototype.__defineSetter__('strokeStyle', function(val){
  if (val instanceof CanvasGradient) {
    this.setStrokePattern(val);
  } else if ('string' == typeof val) {
    var rgba;
    if (rgba = parseColor(val)) {
      this.lastStrokeStyle = rgba;
      this.setStrokeRGBA(
          rgba[0]
        , rgba[1]
        , rgba[2]
        , rgba[3]);
    }
  }
});

/**
 * Get the current stroke style string.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('strokeStyle', normalizedColor('lastStrokeStyle'));

/**
 * Set the shadow color with the given css color string.
 *
 * @see exports.parseColor()
 * @api public
 */

Context2d.prototype.__defineSetter__('shadowColor', function(val){
  if ('string' == typeof val) {
    var rgba;
    if (rgba = parseColor(val)) {
      this.lastShadowColor = rgba;
      this.setShadowRGBA(
          rgba[0]
        , rgba[1]
        , rgba[2]
        , rgba[3]);
    }
  }
});

/**
 * Get the current shadow color string.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('shadowColor', normalizedColor('lastShadowColor'));

Context2d.prototype.__defineSetter__('font', function(val){
  if ('string' == typeof val) {
    var font;
    if (font = parseFont(val)) {
      this.lastFontString = val;
    }
  }
});

/**
 * Get the current font.
 *
 * @see exports.parseFont()
 * @api public
 */

Context2d.prototype.__defineGetter__('font', function(){
  return this.lastFontString || '10px sans-serif';
});