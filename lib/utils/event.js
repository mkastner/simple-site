const log = require('mk-log');
const handlerDef = {
  type: Object,
  value: {},
  writable: false,
  enumerable: true,
  configurable: true,
};

module.exports = function Event() {
  const pub = Object.create(
    {
      addListener(name, handler) {
        let handlersList = this.handlers[name];
        if (!handlersList) {
          handlersList = [];
        }
        handlersList.push(handler);
        this.handlers[name] = handlersList;
      },
      addAsyncListener(name, handler) {
        let handlersList = this.asyncHandlers[name];
        if (!handlersList) {
          handlersList = [];
        }
        handlersList.push(handler);
        this.asyncHandlers[name] = handlersList;
      },
      fire(name, ...values) {
        const handlersList = this.handlers[name];
        if (!handlersList || handlersList.length === 0) {
          return log.warn('firing nonexistent event:', name);
        }
        for (let i = 0, l = handlersList.length; i < l; i++) {
          handlersList[i](...values);
        }
      },
      fireAsync(name, ...values) {
        try {
          const handlersList = this.asyncHandlers[name];
          if (!handlersList || handlersList.length === 0) {
            return log.warn('firing nonexistent async event:', name);
          }
          const promises = handlersList.map((handler) => handler(...values));
          return Promise.all(promises);
        } catch (err) {
          log.error(err);
          return Promise.reject(err);
        }
      },
    },
    {
      handlers: handlerDef,
      asyncHandlers: handlerDef,
    }
  );

  return pub;
};
