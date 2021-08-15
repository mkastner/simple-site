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
  distRootDir,
  page,
  binary,
  modifier,
}) {
  let finalResultPage = page;
  if (!matchedUris || matchedUris.length === 0) return page;
  for (let i = 0, l = matchedUris.length; i < l; i++) {
    try {
      const assetUriPath = matchedUris[i];
      // A modifier builds (like css from scss) and then
      // writes the modified file to the dist directory.
      // Some files like svg are simply copied to the
      // dist directory.

      modifier(assetUriPath);

      if (config.hashedAssetUris) {
        let checkedUriPath = '';
        const writeHashedAssets = WriteHashedAssets({
          distRootDir,
          uriPath: assetUriPath,
        });
        if (binary) {
          checkedUriPath = await writeHashedAssets.fromBinaryFile();
        } else {
          checkedUriPath = await writeHashedAssets.fromTextFile();
        }
        const deployedAssetUri = ensureDeployedAssetUri(checkedUriPath);
        console.log('assetUriPath', assetUriPath);
        console.log('deployedAssetUri', deployedAssetUri);

        finalResultPage = finalResultPage.replace(
          assetUriPath,
          deployedAssetUri
        );
      }
    } catch (err) {
      log.error(err);
    }
  }
  return finalResultPage;
};
