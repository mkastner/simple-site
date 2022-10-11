const log = require('mk-log');
const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
markdown.use(markdownItAttrs);
const populatePathsStore = require('../utils/populate-paths-store.js');
const traverseDirectory = require('../utils/traverse-directory.js');
const globIntentPatterns = require('../utils/glob-intent-patterns.js');
const PathsStore = require('../utils/paths-store.js');
const DirLocations = require('../utils/dir-locations');
const Page = require('./page.js');

async function main() {
  try {
    const traverse = await traverseDirectory(DirLocations.src.absolute);
    traverse.fileGlobPatterns = globIntentPatterns;
    traverse.event.addAsyncListener('file', populatePathsStore);
    traverse.event.addAsyncListener('dir', () => {});
    await traverse.runAsync();
    const pathsStore = PathsStore.getInstance();
    log.info(pathsStore);
    pathsStore.eachPath(async ({ uri, preferredIntents, itemIntents }) => {
      const page = await Page({
        uriPath: uri,
        preferredIntents,
        itemIntents,
        pathsStore,
      });

      if (page) {
        log.info('***    uri', uri);
        await page.toDist();
      }
    });
  } catch (err) {
    log.error(err);
  }
}

main();
