const log = require('mk-log');

module.exports = function requireModule(fullPath) {
  try {
    const loader = require(fullPath);
    log.info('loader', loader);
    return loader;
  } catch (err) {
    log.warn(`No module found at "${fullPath}"`);
    if (err.code !== 'MODULE_NOT_FOUND') {
      return log.error(err);
    }
  }
};
