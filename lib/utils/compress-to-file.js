const streamPromise = require('./stream-promise');
const writeCompress = require('./write-compress-file');
const path = require('path-extra');
const fs = require('fs-extra');
const fsPromises = fs.promises;
const GzipType = 'gz';
const BrotliType = 'br';
const zlib = require('zlib'); 
const crypto = require('crypto');
const log = require('mk-log');


function optionalHashFileName(plainPath, content, useHashedName) {
  if (!useHashedName) { return plainPath; }
  const md5sum = crypto.createHash('md5');
  md5sum.update(content);
  const hash = md5sum.digest('hex');
  const filePath = path.fileNameWithPostfix(plainPath, `-${hash}`);
  return filePath;
}


// plainPath: path without hash and uncompressed
module.exports = function compressToFile(plainPath, compressType, useHashedName) {
  
  if ([GzipType, BrotliType].indexOf(compressType) === -1) {
    throw new Error(`compressType ${compressType} doesn't match any known type`);
  }
  
  try {
  
    const pub = {
      async fromString(content) {
        const checkedPath = optionalHashFileName(plainPath, content, useHashedName);
        await writeCompress(checkedPath, content, compressType); 
      },
      async fromFile() {
        const fileContent = await fsPromises.readFile(plainPath, 'utf8'); 
        pub.fromString(fileContent, fileContent, useHashedName); 
      }
    }
  

    return pub;
  } catch (err) {
    log.error(err); 
  }
}
