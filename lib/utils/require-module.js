const log = require('mk-log');
const path = require('path');

module.exports = function requireModule(filePath) {
  try {
    return require(path.resolve(filePath));
  } catch (err) {
    log.debug(`No module found at "${filePath}"`);
    if (err.code !== 'MODULE_NOT_FOUND') {
      return log.error(err);
    }
  }
};
