
/*!
 * Canvas - Context2d
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var canvas = require('../build/default/canvas')
  , Context2d = canvas.CanvasRenderingContext2d
  , CanvasGradient = canvas.CanvasGradient
  , ImageData = canvas.ImageData
  , PixelArray = canvas.CanvasPixelArray
  , colors = require('./colors');

/**
 * Export `Context2d` as the module.
 */

var Context2d = exports = module.exports = Context2d;

/**
 * Cache color string RGBA values.
 */

var cache = {};

/**
 * Text baselines.
 */

var baselines = ['alphabetic', 'top', 'bottom', 'middle', 'ideographic', 'hanging'];

/**
 * Font RegExp helpers.
 */

var weights = 'normal|bold|bolder|lighter|[1-9]00'
  , styles = 'normal|italic|oblique'
  , units = 'px|pt|pc|in|cm|mm|%'
  , string = '\'([^\']+)\'|"([^"]+)"|[\\w-]+';

/**
 * Font parser RegExp;
 */

var fontre = new RegExp('^ *'
  + '(?:(' + weights + ') *)?'
  + '(?:(' + styles + ') *)?'
  + '([\\d\\.]+)(' + units + ') *'
  + '((?:' + string + ')( *, *(?:' + string + '))*)'
  );

/**
 * Return a function used to normalize an RGBA color `prop`
 * or the pattern previously set.
 *
 * @param {String} prop
 * @return {Function}
 * @api private
 */

function getter(prop) {
  return function(){
    var val = this[prop];
    if (val instanceof CanvasGradient) return val;
    if (1 == val[3]) {
      return '#'
        + val[0].toString(16)
        + val[1].toString(16)
        + val[2].toString(16);
    } else {
      return 'rgba('
        + val[0] + ', '
        + val[1] + ', '
        + val[2] + ', '
        + val[3] + ')';
    }
  }
}

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

var parseFont = exports.parseFont = function(str){
  var font = {}
    , captures = fontre.exec(str);

  // Invalid
  if (!captures) return;

  // Populate font object
  font.weight = captures[1] || 'normal';
  font.style = captures[2] || 'normal';
  font.size = parseFloat(captures[3]);
  font.unit = captures[4];
  font.family = captures[5];

  return font;
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
 * @api private
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
    this.lastFillStyle = val;
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

Context2d.prototype.__defineGetter__('fillStyle', getter('lastFillStyle'));

/**
 * Set the stroke style with the given css color string.
 *
 * @see exports.parseColor()
 * @api public
 */

Context2d.prototype.__defineSetter__('strokeStyle', function(val){
  if (val instanceof CanvasGradient) {
    this.lastStrokeStyle = val;
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

Context2d.prototype.__defineGetter__('strokeStyle', getter('lastStrokeStyle'));

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

Context2d.prototype.__defineGetter__('shadowColor', getter('lastShadowColor'));

/**
 * Set font.
 *
 * @see exports.parseFont()
 * @api public
 */

Context2d.prototype.__defineSetter__('font', function(val){
  if ('string' == typeof val) {
    var font;
    if (font = cache[val] || parseFont(val)) {
      this.lastFontString = val;

      // TODO: dpi
      // TODO: remaining unit conversion
      switch (font.unit) {
        case 'pt':
          font.size /= .75;
          break;
        case 'in':
          font.size *= 96;
          break;
        case 'mm':
          font.size *= 96.0 / 25.4;
          break;
        case 'cm':
          font.size *= 96.0 / 2.54;
          break;
      }

      // Cache font object
      cache[val] = font;

      // Set font
      this.setFont(
          font.weight
        , font.style
        , font.size
        , font.unit
        , font.family);
    }
  }
});

/**
 * Get the current font.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('font', function(){
  return this.lastFontString || '10px sans-serif';
});

/**
 * Set text baseline.
 *
 * @api public
 */

Context2d.prototype.__defineSetter__('textBaseline', function(val){
  var n = baselines.indexOf(val);
  if (~n) {
    this.lastBaseline = val;
    this.setTextBaseline(n);
  }
});

/**
 * Get the current baseline setting.
 *
 * @api public
 */

Context2d.prototype.__defineGetter__('textAlign', function(){
  return this.lastBaseline || 'alphabetic';
});

/**
 * Set text alignment.
 *
 * @api public
 */

Context2d.prototype.__defineSetter__('textAlign', function(val){
  switch (val) {
    case 'center':
      this.setTextAlignment(0);
      this.lastTextAlignment = val;
      break;
    case 'left':
    case 'start':
      this.setTextAlignment(-1);
      this.lastTextAlignment = val;
      break;
    case 'right':
    case 'end':
      this.setTextAlignment(1);
      this.lastTextAlignment = val;
      break;
  }
});

/**
 * Get the current font.
 *
 * @see exports.parseFont()
 * @api public
 */

Context2d.prototype.__defineGetter__('textAlign', function(){
  return this.lastTextAlignment || 'start';
});

/**
 * Get `ImageData` with the given rect.
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @return {ImageData}
 * @api public
 */

Context2d.prototype.getImageData = function(x, y, width, height){
  var arr = new PixelArray(this.canvas, x, y, width, height);
  return new ImageData(arr);
};