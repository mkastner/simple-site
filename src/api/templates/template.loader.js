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

    log.info('apiResult.data', apiResult.data.topics[0].title);

    return {
      data: apiResult,
      // iteration loader must always implement eachItem,
      eachVariant: function eachVariant(clos) {
        const topics = apiResult.data.topics;
        for (let i = 0, l = topics.length; i < l; i++) {
          const topic = topics[i];
          clos({
            fullData: apiResult,
            loaderData: { topic },
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
