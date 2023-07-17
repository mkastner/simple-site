const log = require('mk-log');

const wrapper = {
  map: new Map(),
  set(key, value) {
    //console.log('>>>> key', key);
    //console.log('>>>> instance of String', key instanceof String);
    this.map.set(`${key}`, value);
  },
  get(key) {
    //console.log('<<<< get', key);
    return this.map.get(key);
  },
  has(key) {
    //console.log('processed-asset-paths key   ', key);
    console.log(`processed-asset-paths has "${key}" `, this.map.has(key));
    //console.log('????#### instanceof String', `${key}` instanceof String);
    //console.log('???? has                  ', Array.from(this.map.keys()));
    return this.map.has(key);
  },
};

module.exports = {
  instance: null,

  getInstance() {
    if (!this.instance) {
      this.instance = wrapper;
    }
    return this.instance;
  },
};
