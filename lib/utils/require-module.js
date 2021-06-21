const log = require('mk-log');
module.exports = function requireModule(path) {
  try {
    return require(path);
  } catch (err) {
     log.error(err); 
    if (err.code !== 'MODULE_NOT_FOUND') {
      return log.error(err);
    }
  }
}
