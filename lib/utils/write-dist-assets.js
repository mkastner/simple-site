//const streamPromise = require('./stream-promise');
const writeCompressFile = require('./write-compress-file.js');
const hashFileName = require('./hash-file-name.js');
const Path = require('path-extra');
const fs = require('fs-extra');
const fsPromises = fs.promises;
const GzipType = 'gz';
const BrotliType = 'br';
const env = process.env.NODE_ENV || 'development';
const config = require(Path.resolve(`config/env/${env}-config.js`));
const log = require('mk-log');

// plainPath: path without hash and uncompressed
module.exports = function writeDistAssets({ distRootDir, uriPath }) {
  try {
    //const standardPath = Path.join(distRootDir, uriPath);

    const pub = {
      async fromString(content) {
        // e.g. dist/index-script.js

        //await fs.writeFile(standardPath, content);

        const hashedUriPath = hashFileName(uriPath, content);

        const hashedFilePath = Path.join(distRootDir, hashedUriPath);
        await fs.writeFile(hashedFilePath, content);

        await writeCompressFile(hashedFilePath, content, GzipType);
        await writeCompressFile(hashedFilePath, content, BrotliType);

        if (config.hashedAssetUris) {
          return hashedUriPath;
        }
        return uriPath;
      },
      async fromTextFile() {
        const plainPath = Path.join(distRootDir, uriPath);
        const fileContent = await fsPromises.readFile(plainPath, 'utf8');
        // fromString returns checkedUriPath
        return await pub.fromString(fileContent);
      },
      async fromBinaryFile() {
        const plainPath = Path.join(distRootDir, uriPath);
        // by not using an encoding it should be a buffer
        const fileContent = await fsPromises.readFile(plainPath);
        // fromString returns checkedUriPath
        return await pub.fromString(fileContent);
      },
    };

    return pub;
  } catch (err) {
    log.error(err);
  }
};
