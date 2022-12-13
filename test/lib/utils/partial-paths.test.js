const tape = require('tape');
const PartialPaths = require('../../../lib/utils/partial-paths.js');
const log = require('mk-log');

async function main() {
  tape(async(test) => {
    const partialPaths = await PartialPaths('site');
    const partials = partialPaths.partials;
    log.info('partials', partials);
    test.end();
  });
}

main();