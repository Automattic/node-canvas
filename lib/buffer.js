
/*!
 * Canvas - Buffer
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Concatenate `this` Buffer with `other`.
 *
 * @param {Buffer} other
 * @return {Buffer}
 * @api public
 */

Buffer.prototype.concat = function(other) {
  var len = this.length
    , buf = new Buffer(len + other.length);
  this.copy(buf, 0, 0);
  other.copy(buf, len, 0);
  return buf;
};