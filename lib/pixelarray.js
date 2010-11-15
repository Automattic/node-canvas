
/*!
 * Canvas - PixelArray
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Canvas = require('../build/default/canvas')
  , PixelArray = Canvas.CanvasPixelArray;

/**
 * Custom inspect.
 */

PixelArray.prototype.inspect = function(){
  var buf = '[PixelArray ';
  for (var i = 0, len = this.length; i < len; ++i) {
    buf += '\n  ' + i + ': rgba('
      + this[i++] + ','
      + this[i++] + ','
      + this[i++] + ','
      + this[i] + ')';
  }
  return buf + '\n]';
};
