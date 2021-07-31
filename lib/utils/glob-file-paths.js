const Path = require('path');

module.exports = function globFilePaths(localFilePath, globIntentPatterns) {
  const result = globIntentPatterns.map((pattern) =>
    Path.join(localFilePath, pattern)
  );
  return result;
};
