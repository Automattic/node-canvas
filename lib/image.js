'use strict';

/*!
 * Canvas - Image
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Canvas = require('./bindings')
  , Image = Canvas.Image;

/**
 * Src setter.
 *
 *  - convert data uri to `Buffer`
 *
 * @param {String|Buffer} val filename, buffer, data uri
 * @api public
 */

Image.prototype.__defineSetter__('src', function(val){
  if ('string' == typeof val && 0 == val.indexOf('data:')) {
    val = val.slice(val.indexOf(',') + 1);
    this.source = new Buffer(val, 'base64');
  } else {
    this.source = val;
  }
});

/**
 * Src getter.
 *
 * TODO: return buffer
 *
 * @api public
 */

Image.prototype.__defineGetter__('src', function(){
  return this.source;
});

/**
 * Inspect image.
 *
 * TODO: indicate that the .src was a buffer, data uri etc
 *
 * @return {String}
 * @api public
 */

Image.prototype.inspect = function(){
  return '[Image'
    + (this.complete ? ':' + this.width + 'x' + this.height : '')
    + (this.src ? ' ' + this.src : '')
    + (this.complete ? ' complete' : '')
    + ']';
};
