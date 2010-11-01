
/*!
 * Canvas - utils
 * Copyright (c) 2010 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 */

/**
 * Concatenate `bufs` / `lens`.
 *
 * @param {Array} bufs
 * @param {Array} lens
 * @return {Buffer}
 * @api private
 */

exports.concatBuffers = function(bufs, lens) {
  var buf
    , length = 0
    , offset = 0;

  // Determine length
  for (var i = 0, len = lens.length; i < len; ++i) {
    length += lens[i];
  }

  // Allocate buffer
  buf = new Buffer(length);

  // Copy
  for (var i = 0, len = bufs.length; i < len; ++i) {
    bufs[i].copy(buf, offset);
    offset += lens[i];
  }
  return buf;
};