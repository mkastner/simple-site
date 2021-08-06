const axios = require('axios');
const log = require('mk-log');
const Path = require('path');
const Cache = require(Path.resolve('lib/utils/data-cache.js'));
const ids = [
  230, // Hypothekenvergleich
  35, //Studenentkredit
];

async function load() {
  try {
    const cache = Cache.getInstance();

    const apiResult = await cache.pullAsync(this.loopName, async () => {
      const result = await axios({
        url: `https://www.fmh.de/api/topics/list-by-ids/${ids.join('-')}`,
      });
      return result.data.topics;
    });

    log.info(
      'apiResult',
      apiResult.map((r) => {
        return { id: r.id, title: r.title };
      })
    );

    return {
      data: apiResult,
      // iteration loader must always implement eachItem,
      eachVariant: function eachVariant(clos) {
        const topics = apiResult;
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
