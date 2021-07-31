const axios = require('axios');
const log = require('mk-log');

async function load() {
  try {
    const response = await axios.get(
      `https://www.fmh.de/api/topics/tree?url=${encodeURIComponent(
        '/'
      )}&maxDepth=2`
    );
    const topLevel = response.data.children;
    const pub = {
      data: topLevel,
    };

    pub.result = function result(fnc, reqPath) {
      const devReqPath = reqPath; // live request path as sent by browser
      const buildReqPath = reqPath; // build request path as sent by builder
      fnc(pub.data, { itemData: pub.data, devReqPath, buildReqPath });
    };

    return pub;
  } catch (err) {
    log.error(err);
  }
}

module.exports = {
  load,
};
