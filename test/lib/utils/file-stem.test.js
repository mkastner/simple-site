const tape = require('tape');
const fileStem = require('../../../lib/utils/file-stem.js');
//const log = require('mk-log');
tape((t) => {
  const queryPath = '/home/webhost/test.js?a=10&b=12';

  const queryStem = fileStem(queryPath);

  t.equals(queryStem, 'test');

  const extPath = '/home/webhost/test.js';

  const extStem = fileStem(extPath);

  t.equals(extStem, 'test');

  t.end();
});
