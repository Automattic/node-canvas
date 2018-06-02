'use strict';

/**
 * Buffer creator.
 *
 * To support old NodeJS.
 */

const BufferCreator = {
  allocUnsafe: Buffer.allocUnsafe || function (size) {
    return new Buffer(size);
  },

  from: Buffer.from || function (string, encoding) {
    return new Buffer(string, encoding);
  }
};

module.exports = BufferCreator;
