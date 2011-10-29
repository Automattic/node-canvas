
/*!
 * Canvas - PixelArray
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Canvas = require('./bindings')
  , PixelArray = Canvas.CanvasPixelArray;

/**
 * Custom inspect.
 */

PixelArray.prototype.inspect = function(){
  var buf = '[PixelArray ';
  for (var i = 0, len = this.length; i < len; i += 4) {
    buf += '\n  ' + i + ': rgba('
      + this[i + 0] + ','
      + this[i + 1] + ','
      + this[i + 2] + ','
      + this[i + 3] + ')';
  }
  return buf + '\n]';
};
