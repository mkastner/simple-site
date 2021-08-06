const log = require('mk-log');

module.exports = {
  instance: null,

  getInstance() {
    if (this.instance) {
      log.info('found instance of DataCache');
      return this.instance;
    }
    log.info('creating new instance of DataCache');
    this.instance = Object.create(
      {
        put(key, value) {
          this.map.set(key, value);
        },
        async pullAsync(key, clos) {
          const val = this.map.get(key);
          if (val) return val;
          const result = await clos();
          this.put(key, result);
          return result;
        },
      },
      {
        map: {
          type: Map,
          enumerable: true,
          value: new Map(),
        },
      }
    );
    return this.instance;
  },
};
