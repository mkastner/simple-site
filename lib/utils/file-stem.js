const Path = require('path');
//const log = require('mk-log');

module.exports = function fileStem(path) {
  if (!path) return '';
  const fileName = Path.basename(path);
  return fileName.replace(/\..*?$/, () => {
    return '';
  });
};
