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
      const docs = apiResult.data.data.awards.docs[0].commendations.docs;
      for (let i = 0, l = docs.length; i < l; i++) {
        const doc = docs[i];
        const devRegExp = new RegExp(`/${doc.volume.year}$`);
        let devReqPath;
        
        if (reqPath.match(devRegExp)) {
          devReqPath = reqPath.replace(devRegExp, '/year');
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

module.exports = async function YearLoop() {
  try {
    const result = await load();
    return result;
  } catch (err) {
    log.error(err);
  }
};
