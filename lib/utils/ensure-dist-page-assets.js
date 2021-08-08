const writeDistAssets = require('../utils/write-dist-assets.js');
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
    log.info('joinedPath', joinedPath);
    return joinedPath;
  }
  return assetUri;
}

module.exports = async function ensureDistPageAssets({
  matchedUris,
  distRootDir,
  page,
  modifier,
}) {
  let finalResultPage = page;
  log.info('matchedUris', matchedUris);
  if (!matchedUris || matchedUris.length === 0) return page;
  for (let i = 0, l = matchedUris.length; i < l; i++) {
    try {
      const assetUriPath = matchedUris[i];
      log.info('========= assetUriPath', assetUriPath);
      modifier(assetUriPath);

      //buildAsset(assetUriPath).writeCss();
      const checkedUriPath = await writeDistAssets({
        distRootDir,
        uriPath: assetUriPath,
      }).fromFile();
      const deployedAssetUri = ensureDeployedAssetUri(checkedUriPath);
      log.info('********** deployedAssetUri', deployedAssetUri);
      finalResultPage = finalResultPage.replace(assetUriPath, deployedAssetUri);
    } catch (err) {
      log.error(err);
    }
  }
  return finalResultPage;
};
