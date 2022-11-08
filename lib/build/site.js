const log = require('mk-log');
const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
markdown.use(markdownItAttrs);
const populatePathsStore = require('../utils/populate-paths-store.js');
const traverseDirectory = require('../utils/traverse-directory.js');
const globIntentPatterns = require('../utils/glob-intent-patterns.js');
const globStaticPatterns = require('../utils/glob-static-patterns.js');
const PathsStore = require('../utils/paths-store.js');
const DirLocations = require('../utils/dir-locations.js');
const StaticFiles = require('../utils/static-files.js');
const Page = require('./page.js');

async function main() {
  try {
    const traverseIntents = await traverseDirectory(DirLocations.src.absolute);
    traverseIntents.fileGlobPatterns = globIntentPatterns;
    traverseIntents.event.addAsyncListener('file', populatePathsStore);
    traverseIntents.event.addAsyncListener('dir', () => {});
    await traverseIntents.runAsync();
    const pathsStore = PathsStore.getInstance();
    log.debug(pathsStore);
    await pathsStore.eachPath(
      async ({ uri, preferredIntents, itemIntents }) => {
        const page = await Page({
          uriPath: uri,
          preferredIntents,
          itemIntents,
          pathsStore,
        });

        if (page) {
          log.info('---     uri', uri);
          await page.toDist();
        }
      }
    );

    const staticFiles = StaticFiles(DirLocations.dist.absolute);
    const traverseStatics = await traverseDirectory(DirLocations.src.absolute);
    traverseStatics.fileGlobPatterns = globStaticPatterns;
    traverseStatics.event.addAsyncListener('file', staticFiles.copy);
    traverseStatics.event.addAsyncListener('dir', () => {});
    await traverseStatics.runAsync();
  } catch (err) {
    log.error(err);
  }
}

main();
