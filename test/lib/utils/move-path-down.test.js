const tape = require('tape');
const log = require('mk-log');
const movePathDown = require('../../../lib/utils/move-path-down.js');

tape('path down', (t) => {

  try {

    let result = [];
  
    let count = 0;

    movePathDown('/test1/test2/test3', 0,(item) => {
      result.push(item);
      count += 1;
      if (count > 4) return process.exit(0);
    });

    t.equals(result[0], '/');
    t.equals(result[1], '/test1');
    t.equals(result[2], '/test1/test2');
    t.equals(result[3], '/test1/test2/test3');
  
  } catch (err) {

    log.error(err);

  } finally {
    t.end();
  }

});

