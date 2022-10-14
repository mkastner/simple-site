const log = require('mk-log');
const fs = require('fs-extra');
const Path = require('path');

module.exports = function StaticFiles(distRoot) {
  return {
    async copy({ file, initialDirectory }) {
      const uri = file.replace(initialDirectory, '');
      const targetFile = Path.join(distRoot, uri);
      log.info('copying static file', uri);
      return await fs.copy(file, targetFile);
    },
  };
};
