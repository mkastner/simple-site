const {merge} = require('webpack-merge');
const env = process.env.NODE_ENV;

module.exports = function mergeCustomConfigEnv(customConfig) {
  if (!customConfig) return {};
  if (!customConfig.base) return {};
  if (!customConfig[env]) return customConfig.base;
  return merge(customConfig.base, customConfig[env]); 
};
