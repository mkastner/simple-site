const tape = require('tape');
const traverseDirectory = require('../../../lib/utils/traverse-directory.js');
const globIntentPatterns = require('../../../lib/utils/glob-intent-patterns');
const log = require('mk-log');

async function main() {
  await tape(async (t) => {
    try {
      const traverse = await traverseDirectory('src');
      traverse.fileGlobPatterns = globIntentPatterns;
      traverse.event.addListener('dir', (dir) => log.info(dir));
      traverse.event.addListener('file', (file) => log.info(file));
      await traverse.runAsync();
      t.end();
    } catch (err) {
      log.error(err);
    } finally {
      process.exit(0);
    }
  });
}

main();
