//const streamPromise = require('./stream-promise');
const writeCompressFile = require('./write-compress-file.js');
const hashFileName = require('./hash-file-name.js');
const path = require('path-extra');
const fs = require('fs-extra');
const fsPromises = fs.promises;
const GzipType = 'gz';
const BrotliType = 'br';
//const zlib = require('zlib');
const log = require('mk-log');

// plainPath: path without hash and uncompressed
module.exports = function writeDistAssets({ distRootDir, uriPath }) {
  try {
    const pub = {
      async fromString(content) {
        // e.g. dist/index-script.js
        const standardPath = path.join(distRootDir, uriPath);

        await fs.writeFile(standardPath, content);

        const hashedUriPath = hashFileName(uriPath, content);

        const hashedFilePath = path.join(distRootDir, hashedUriPath);
        await fs.writeFile(hashedFilePath, content);

        log.info('hashedFilePath', hashedFilePath);

        await writeCompressFile(hashedFilePath, content, GzipType);
        await writeCompressFile(hashedFilePath, content, BrotliType);

        return hashedUriPath;
      },
      async fromFile() {
        const plainPath = path.join(distRootDir, uriPath);
        const fileContent = await fsPromises.readFile(plainPath, 'utf8');
        // fromString returns checkedUriPath
        return await pub.fromString(fileContent);
      },
    };

    return pub;
  } catch (err) {
    log.error(err);
  }
};
