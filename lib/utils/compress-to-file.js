//const streamPromise = require('./stream-promise');
const writeCompressFile = require("./write-compress-file.js");
const hashFileName = require("./hash-file-name.js");
const path = require("path-extra");
const fs = require("fs-extra");
const fsPromises = fs.promises;
const GzipType = "gz";
const BrotliType = "br";
//const zlib = require('zlib');
const log = require("mk-log");


function optionalHashFileName(uriPath, content, useHashedName) {
  if (!useHashedName) {
    return uriPath;
  }
  return hashFileName(uriPath,content);
}

// plainPath: path without hash and uncompressed
module.exports = function compressToFile({
  distRootDir,
  uriPath,
  compressType,
  useHashedName,
}) {
  if ([GzipType, BrotliType].indexOf(compressType) === -1) {
    throw new Error(
      `compressType ${compressType} doesn't match any known type`
    );
  }

  try {
    const pub = {
      async fromString(content) {
        const checkedUriPath = optionalHashFileName(
          uriPath,
          content,
          useHashedName
        );
        const checkedTargetPath = path.join(distRootDir, checkedUriPath);
        await writeCompressFile(checkedTargetPath, content, compressType);
        return checkedUriPath;
      },
      async fromFile() {
        const plainPath = path.join(distRootDir, uriPath);
        const fileContent = await fsPromises.readFile(plainPath, "utf8");
        // fromString returns checkedUriPath
        return await pub.fromString(fileContent);
      },
    };

    return pub;
  } catch (err) {
    log.error(err);
  }
};
