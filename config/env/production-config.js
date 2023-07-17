const baseConfig = require('./base-config');

module.exports = Object.assign(baseConfig, {
  logLevel: 'info',
  assetUri: 'https://local.der-markt.com',
  baseUri: 'https://local.der-markt.com',
  hashedAssetUris: true,
});
