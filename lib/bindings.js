/**
 * Compat for changes from node 0.4.x to 0.6.x.
 */
var err;

try {
  module.exports = require('../build/Release/canvas');
} catch (e) {
  err = e;
  try {
    module.exports = require('../build/default/canvas');
  } catch (e) {
    if (!/^Cannot find module/.test(err.message)) {
      throw e;
    }
    throw err;
  }
}
