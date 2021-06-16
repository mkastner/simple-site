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
    log.info('load');
    const result = await axios({ 
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
      }
    });
    result.data.data.awards.docs[0]
      .commendations.docs.sort(sortVolumeByYear);
    return result.data.data; 
  } catch (err) {
    log.error(err);
    return null;
  }
}

module.exports = async function YearsLoader() {

  try {
    const result = await load();
    log.info(result);
    return result;
  } catch (err) {
    log.error(err);
  }


} 
