const Path = require('path-extra');
const env = process.env.NODE_ENV || 'development';
const config = require(Path.resolve(`config/env/${env}-config.js`));

const regExp = /href="\//gim;

module.exports = function ensureDistPageBasePaths(page) {
  if (!config.baseUri) {
    return page;
  }
  return page.replace(regExp, `href="${config.baseUri}/`);
};
