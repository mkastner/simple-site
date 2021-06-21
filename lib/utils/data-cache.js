module.exports = function DataCache() {

  let instance;

  function getInstance() {
    if (instance) return instance; 
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
