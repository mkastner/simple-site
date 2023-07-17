const FastGlob = require('fast-glob');
const log = require('mk-log');

module.exports = function fileExistsAtPath(path) {
  const globbedTargets = FastGlob.sync(path);
  return globbedTargets.length;
};
