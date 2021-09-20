const Path = require('path');
const axios = require('axios');
const log = require('mk-log');
const preferredTopicUrl = require('../../lib/utils/preferred-topic-url.js');
const ids = [
  2964, // Hypothekenzinsen Landing
  2973, // Forwardzinsen Landing
];

async function load() {
  try {
    const apiResult = await axios({
      url: `https://www.fmh.de/api/topics/list-by-ids/${ids.join('-')}/100`,
    });

    return {
      data: apiResult,
      // iteration loader must always implement eachVariant,
      eachVariant: function eachVariant(clos) {
        const topics = apiResult.data.topics;
        for (let i = 0, l = topics.length; i < l; i++) {
          const topic = topics[i];
          const pathSection = Path.basename(preferredTopicUrl(topic));
          clos({
            fullData: apiResult,
            loaderData: { topic },
            pathSection,
            length: l,
          });
        }
      },
    };
  } catch (err) {
    log.error(err);
    return null;
  }
}

module.exports = {
  load,
};
