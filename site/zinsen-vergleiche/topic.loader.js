const axios = require('axios');
const Path = require('path');
const log = require('mk-log');
const preferredTopicUrl = require('../../lib/utils/preferred-topic-url.js');
const ids = [
  2964, // Hypothekenzinsen Landing
  2973, // Forwardzinsen Landing
];

async function load() {
  try {
    const apiTopicsResult = await axios({
      url: `https://www.fmh.de/api/topics/list-by-ids/${ids.join('-')}/100`,
    });

    const topicIds = apiTopicsResult.data.topics.map((t) => t.id);

    const apiSegmentsResult = await axios({
      url: `https://www.fmh.de/api/topics/children/${topicIds.join(
        '-'
      )}/segment`,
    });

    const orderedSegments = apiSegmentsResult.data.sort(
      (a, b) => a.position - b.position
    );

    return {
      data: apiTopicsResult,
      // iteration loader must always implement eachVariant,
      eachVariant: function eachVariant(clos) {
        const topics = apiTopicsResult.data.topics;
        for (let i = 0, l = topics.length; i < l; i++) {
          const topic = topics[i];
          log.info('preferredTopicUrl', preferredTopicUrl(topic));
          log.info('topic.title      ', topic.title);
          clos({
            fullData: apiTopicsResult,
            loaderData: {
              topic,
              segments: apiSegmentsResult.data.filter(
                (segment) => segment.parent_id === topic.id
              ),
            },
            pathSection: Path.basename(preferredTopicUrl(topic)),
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

// load

module.exports = {
  load,
};
