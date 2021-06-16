module.exports = function Event() {

  const pub = Object.create({
    addListener(name, handler) {
      let handlersList = this.handlers[name]; 
      if (!handlersList) {
        handlersList = []; 
      }
      handlersList.push(handler);
      this.handlers = handlersList;
    },
    fire(name, ...values) {
      this.handlersList[name](...values);
    }
  }, {
    handlers: {
      type: Object,
      value: {},
      writable: false,
      enumerable: true,
      configurable: true,
    }
  });

  return pub;

}
