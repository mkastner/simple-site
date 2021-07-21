const axios = require('axios');
const log = require('mk-log');
const Cache = require('../../../../lib/utils/data-cache.js')();
const cache = Cache.getInstance();

function sortVolumeByYear(docA, docB) {
  const yearA = docA.volume.year;
  const yearB = docB.volume.year;

  if (yearA < yearB) return 1;
  if (yearA > yearB) return -1;
  return 0;
}

const loopRegExp = /\/\d{4}/gim;

async function load() {
  try {
    let apiResult = cache.data['year-loop'];

    if (!apiResult) {
      apiResult = await axios({
        url: 'https://api-auszeichnungen.fmh.de/graphql',
        method: 'post',
        data: {
          query: `
          { 
            awards( search: { active:true, name: "finanz-award" }) {
              docs {
                name
                description 
                commendations(search:{active: true}) {
                  docs {
                    id 
                    image_file_name
                    description 
                    volume(search: {active: true}) {
                      year
                    }
                  }
                }
              }
            }
          }
          `,
        },
      });

      cache.put('year-loop', apiResult);
    }
    apiResult.data.data.awards.docs[0].commendations.docs.sort(
      sortVolumeByYear
    );

    const pub = {
      data: apiResult.data.data,
    };
    // here out is a loop of results
    // in other cases out is single
    pub.result = function result(fnc, reqPath) {
      log.info('****************** reqPath', reqPath);
      const docs = apiResult.data.data.awards.docs[0].commendations.docs;
      for (let i = 0, l = docs.length; i < l; i++) {
        const doc = docs[i];
        log.info('doc.volume.year', doc.volume.year);
        let devReqPath;

        log.info(`reqPath.match ${loopRegExp} ?`, reqPath.match(loopRegExp));

        if (reqPath.match(loopRegExp)) {
          devReqPath = reqPath.replace(loopRegExp, '/year');
        }
        const buildReqPath = reqPath.replace('year-loop', doc.volume.year);
        fnc(pub.data, { itemData: doc, devReqPath, buildReqPath });
      }
    };

    return pub;
  } catch (err) {
    log.error(err);
    return null;
  }
}

module.exports = {
  load,
  // use matchesLoopPath in build-path-content.js
  // for development in order to match dynamic
  // i.e. loop routes
  // in dev requests
  matchesLoopPath(devReqPath) {
    return devReqPath.match(loopRegExp);
  },
};
