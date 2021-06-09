const yearsList = ['2014', '2015']
const log = require('mk-log');

async function fetch() {
  return Promise.resolve(yearsList);
}

module.exports = async function years() {
  try {

    const pub = {
      fetch,
    };

    return pub;

  } catch (err) {
    
  }
}
