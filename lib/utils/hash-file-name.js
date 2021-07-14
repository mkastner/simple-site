const crypto = require("crypto");
const path = require("path-extra");

module.exports = function hashFileName(uriPath, content) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(content);
  const hash = md5sum.digest("hex");
  const hashedUriPath = path.fileNameWithPostfix(uriPath, `-${hash}`);
  return hashedUriPath;
};
