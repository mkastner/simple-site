const axios = require('axios');
const log = require('mk-log');

async function load() {
  try {
    const topLevelResponse = await axios.get(
      `https://www.fmh.de/api/topics/tree?url=${encodeURIComponent(
        '/'
      )}&maxDepth=2`
    );
    const topLevel = topLevelResponse.data.children;
    const topicResponse = await axios.get(
      'https://www.fmh.de/api/topics/topic/1'
    );
    const topic = topicResponse.data;
    return {
      topLevel,
      topic,
    };
  } catch (err) {
    log.error(err);
  }
}

module.exports = {
  load,
};
