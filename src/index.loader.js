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
    return {
      data: topLevel,
    };
  } catch (err) {
    log.error(err);
  }
}

module.exports = {
  load,
};
