const FastGlob = require('fast-glob');
const Path = require('path');
const globIntentPatterns = require('./glob-intent-patterns.js');
const globFilePaths = require('./glob-file-paths.js');
const log = require('mk-log');

module.exports = function childDirectoriesWithIntentFiles(absDirPath) {
  const childDirs = FastGlob.sync(Path.join(absDirPath, '*'), {
    onlyDirectories: true,
  });
  const result = [];
  for (let i = 0, l = childDirs.length; i < l; i++) {
    const childDirPath = childDirs[i];
    const globbedIntentFiles = globFilePaths(childDirPath, globIntentPatterns);
    const foundIntentFiles = FastGlob.sync(globbedIntentFiles);
    if (foundIntentFiles.length) {
      result.push(childDirPath);
    }
  }
  log.info('result', result);
  return result;
};
