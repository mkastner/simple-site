const tape = require('tape');
const log = require('mk-log');
const movePathUp = require('../../../lib/utils/move-path-up');

tape('path up', (t) => {

  try {

    let result = [];
  
    let count = 0;

    movePathUp('/test1/test2/test3', (item) => {
      result.push(item);
      count += 1;
      if (count > 4) return process.exit(0);
    });

    t.equals(result[0], '/test1/test2/test3');
    t.equals(result[1], '/test1/test2');
    t.equals(result[2], '/test1');
    t.equals(result[3], '/');
  
  } catch (err) {

    log.error(err);

  } finally {
    t.end();
  }

});
