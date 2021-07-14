const log = require('mk-log');
module.exports = function DataCache() {

  let instance;

  function getInstance() {
    if (instance) {
      log.info('found instance of DataCache'); 
      return instance; 
    }
    log.info('creating new instance of DataCache'); 
    instance = Object.create({
      put(key, value) {
        this.data[key] = value;
      } 
    }, {
      data: {
        type: Object,
        enumerable: true,
        value: {}
      } 
    });
    return instance;
  }

  return {
    getInstance
  }
};
