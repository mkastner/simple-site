const axios = require('axios');
const log = require('mk-log');

function sortVolumeByYear(docA, docB) {
  const yearA = docA.volume.year;
  const yearB = docB.volume.year;

  if (yearA < yearB) return 1;
  if (yearA > yearB) return -1;
  return 0;
}

async function load() {
  try {
    const apiResult = await axios({
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

    apiResult.data.data.awards.docs[0].commendations.docs.sort(sortVolumeByYear);

    const pub = {
      data: apiResult.data.data,
    };
    // here result handles a single result
    pub.result = function result(fnc, reqPath) {
      const devReqPath = reqPath; // live request path as sent by browser
      const buildReqPath = reqPath; // build request path as sent by builder
      fnc(pub.data, {itemData: pub.data, devReqPath, buildReqPath});
    };

    return pub;
  } catch (err) {
    log.error(err);
    return null;
  }
}

module.exports = async function YearsLoader() {
  try {
    const result = await load();
    return result;
  } catch (err) {
    log.error(err);
  }
};
