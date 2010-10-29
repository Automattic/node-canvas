
/*!
 * Canvas - Buffer
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Concatenate `this` Buffer with `buf`.
 *
 * @param {Buffer} buf
 * @return {Buffer}
 * @api public
 */

Buffer.prototype.concat = function(buf) {
  var len = this.length
    , tmp = new Buffer(len + buf.length);
  this.copy(tmp, 0, 0);
  buf.copy(tmp, len, 0);
  return tmp;
};