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

async function load() {
  try {
    const that = this;

    let apiResult = cache.data[that.loopName];

    if (apiResult) {
      log.info('taking api result from cache', that.loopName);
    } else {
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
      const docs = apiResult.data.data.awards.docs[0].commendations.docs;
      for (let i = 0, l = docs.length; i < l; i++) {
        const doc = docs[i];
        let devReqPath;
        if (reqPath.match(that.loopRegExp)) {
          devReqPath = that.replaceMutablePathSegment(reqPath);
        }
        const buildReqPath = reqPath.replace(that.loopName, doc.volume.year);
        fnc(pub.data, {
          itemData: doc,
          buildReqPath: devReqPath || buildReqPath,
        });
      }
    };

    return pub;
  } catch (err) {
    log.error(err);
    return null;
  }
}

// every loop loader must implement:
// loopName
// loopRegExp
// load
// matchesLoopPath
// replaceMutablePathSegment

module.exports = {
  loopName: 'year-loop',
  loopRegExp: /\/(\d{4})/,
  load,
  // use matchesLoopPath in build-path-content.js
  // for development in order to match dynamic
  // i.e. loop routes
  // in dev requests
  matchesLoopPath(devReqPath) {
    const matchesLoopPath = devReqPath.match(this.loopRegExp);
    return matchesLoopPath;
  },
  replaceMutablePathSegment(reqPath) {
    return reqPath.replace(this.loopRegExp, `/${this.loopName}`);
  },
};
