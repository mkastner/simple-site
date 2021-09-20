const fs = require('fs-extra');
const GzipType = 'gz';
const BrotliType = 'br';
const zlib = require('zlib');
const log = require('mk-log');
const streamPromise = require('./stream-promise');

module.exports = async function writeCompressFile(
  filePath,
  contentString,
  compressType
) {
  try {
    if ([GzipType, BrotliType].indexOf(compressType) === -1) {
      throw new Error(
        `compressType ${compressType} doesn't match any known type`
      );
    }

    const targetPath = filePath + `.${compressType}`;

    let writeStream = fs.createWriteStream(targetPath);
    let compressionStream;

    if (compressType === GzipType) {
      compressionStream = zlib.createGzip({
        level: zlib.constants.Z_BEST_COMPRESSION,
        info: true,
      });
    } else {
      compressionStream = zlib.createBrotliCompress();
    }

    compressionStream.pipe(writeStream);
    compressionStream.write(contentString);
    await streamPromise(compressionStream);
    log.debug('html with compression written to ', targetPath);
  } catch (err) {
    log.error(err);
  }
};
