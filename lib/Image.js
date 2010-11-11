
/*!
 * Canvas - Image
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Canvas = require('../build/default/canvas')
  , Image = Canvas.Image;

/**
 * Inspect image.
 *
 * @return {String}
 * @api public
 */

Image.prototype.inspect = function(){
  return '[Image'
    + (this.complete ? ' complete' : '')
//    + ' ' + this.src
    + ']';
};