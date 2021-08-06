const axios = require('axios');
const log = require('mk-log');
const ids = [
  230, // Hypothekenvergleich
  35, //Studenentkredit
];

async function load() {
  try {
    const apiResult = await axios({
      url: `https://www.fmh.de/api/topics/list-by-ids/${ids.join('-')}`,
    });

    return {
      data: apiResult,
      // iteration loader must always implement eachItem,
      eachVariant: function eachVariant(clos) {
        const topics = apiResult.data.topics;
        for (let i = 0, l = topics.length; i < l; i++) {
          const topic = topics[i];
          log.info('topic.id', topic.id);

          clos({
            fullData: apiResult,
            itemData: topic,
            pathSection: topic.id,
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
