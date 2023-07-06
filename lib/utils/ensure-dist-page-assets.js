const WriteHashedAssets = require('../utils/write-hashed-assets.js');
const Path = require('path-extra');
const log = require('mk-log');
const env = process.env.NODE_ENV || 'development';
const config = require(Path.resolve(`config/env/${env}-config.js`));

function ensureDeployedAssetUri(assetUri) {
  if (config.assetUri) {
    // config assetUri could be something like
    // https://static.fmh.de/sites/www.fmh.de
    // and might return e.g. something like
    // https://static.fmh.de/sites/www.fmh.de/css/styles.css
    const joinedPath = `${config.assetUri}${assetUri}`;
    return joinedPath;
  }
  return assetUri;
}

module.exports = async function ensureDistPageAssets({
  matchedUris,
  page,
  binary,
  modifier = async (uriPath) => uriPath,
}) {
  let finalResultPage = page;
  if (!matchedUris || matchedUris.length === 0) return page;

  // log.info('matchedUris', matchedUris.length, matchedUris[0]);
  for (let i = 0, l = matchedUris.length; i < l; i++) {
    //    try {
    const assetUriPath = matchedUris[i];
    //log.info('assetUriPath', assetUriPath);
    // A modifier builds (like css from scss) and then
    // writes the modified file to the dist directory.
    // Some files like svg are simply copied to the
    // dist directory.

    await modifier(assetUriPath);

    // log.info('___________ past assetUriPath', assetUriPath);

    if (config.hashedAssetUris) {
      let checkedUriPath = '';
      const writeHashedAssets = WriteHashedAssets({
        uriPath: assetUriPath,
      });
      if (binary) {
        checkedUriPath = await writeHashedAssets.fromBinaryFile();
      } else {
        checkedUriPath = await writeHashedAssets.fromTextFile();
      }
      const deployedAssetUri = ensureDeployedAssetUri(checkedUriPath);

      // log.info('|||||||||||||||||assetUriPath', assetUriPath);
      // log.info('checkecUriPath               ', checkedUriPath);

      finalResultPage = finalResultPage.replace(assetUriPath, deployedAssetUri);
    }
    //    } catch (err) {
    //      log.error(err);
    //    }
  }

  //log.info('finalResultPage', finalResultPage.length);
  return finalResultPage;
};
