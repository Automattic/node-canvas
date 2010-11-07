
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

// patch if not v0.2 of node.js and Buffer.isBuffer fails for SlowBuffer
if (process.version.indexOf("v0.2") == -1) {
    var SlowBuffer = process.binding('buffer').SlowBuffer;
    if (!Buffer.isBuffer(new SlowBuffer(10))) {
        Buffer.isBuffer = function (b) {
            return (b instanceof Buffer) || (b instanceof SlowBuffer);
        };
    }
}