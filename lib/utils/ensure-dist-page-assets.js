const WriteHashedAssets = require('../utils/write-hashed-assets.js');
const ProcessedAssetPaths = require('../utils/processed-asset-paths.js');
const Path = require('path-extra');
const log = require('mk-log');
const env = process.env.NODE_ENV || 'development';
const config = require(Path.resolve(`config/env/${env}-config.js`));
const processedAssetPaths = ProcessedAssetPaths.getInstance();

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
  //log.info('processedAssetPaths', processedAssetPaths);

  if (!matchedUris || matchedUris.length === 0) return page;

  for (let i = 0, l = matchedUris.length; i < l; i++) {
    //    try {
    const assetUriPath = matchedUris[i];

    // check if the asset is already processed
    // if so, replace the assetUriPath with the
    // processed assetUriPath i.e. the hashed assetUriPath
    //log.info('!!! ' + Array.from(processedAssetPaths.keys()).join(',\n'));
    if (processedAssetPaths.has(assetUriPath)) {
      //console.log('===> cached assetUriPath ', assetUriPath);
      const deployedAssetUri = processedAssetPaths.get(assetUriPath);
      finalResultPage = finalResultPage.replace(assetUriPath, deployedAssetUri);
    } else {
      //console.log('!!! uncached assetUriPath', assetUriPath);
      // A modifier builds (like css from scss) and then
      // writes the modified file to the dist directory.
      // Some files like svg are simply copied to the
      // dist directory.
      //log.info('uncached assetUriPath', assetUriPath);

      await modifier(assetUriPath);

      // hashedAssetUris is a config option that is set to true
      // for cache busting urls.
      // processedAssetPaths is a map that holds the original uriPath
      // and the hashed uriPath.

      // if (config.hashedAssetUris && !processedAssetPaths.has(assetUriPath)) {

      if (config.hashedAssetUris) {
        // && !processedAssetPaths.has(assetUriPath)) {
        let checkedUriPath = '';
        const writeHashedAssets = WriteHashedAssets({
          uriPath: assetUriPath,
          onHashed: (_uriPath, _hashedUriPath) => {
            //processedAssetPaths.set(uriPath, hashedUriPath);
          },
        });
        if (binary) {
          checkedUriPath = await writeHashedAssets.fromBinaryFile();
        } else {
          log.info('checkedUriPath', checkedUriPath);
          checkedUriPath = await writeHashedAssets.fromTextFile();
        }

        const deployedAssetUri = ensureDeployedAssetUri(checkedUriPath);
        // console.log('caching', assetUriPath, deployedAssetUri);

        processedAssetPaths.set(assetUriPath, deployedAssetUri);
        finalResultPage = finalResultPage.replace(
          assetUriPath,
          deployedAssetUri
        );
      }
    }
  }

  //log.info('finalResultPage', finalResultPage.length);
  return finalResultPage;
};
