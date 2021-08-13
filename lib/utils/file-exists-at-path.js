const FastGlob = require('fast-glob');

module.exports = function fileExistsAtPath(path) {
  const globbedTargets = FastGlob.sync(path);
  return globbedTargets.length;
};
