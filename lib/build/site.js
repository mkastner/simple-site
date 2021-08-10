const Path = require('path-extra');
const log = require('mk-log');
const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
markdown.use(markdownItAttrs);
const populatePathsStore = require('../utils/populate-paths-store.js');
const traverseDirectory = require('../utils/traverse-directory.js');
const globIntentPatterns = require('../utils/glob-intent-patterns.js');
const PathsStore = require('../utils/paths-store.js');
const srcRootDir = Path.resolve('src');
const distRootDir = Path.resolve('dist');
const Page = require('./page.js');

async function main() {
  try {
    const traverse = await traverseDirectory(srcRootDir);
    traverse.fileGlobPatterns = globIntentPatterns;
    traverse.event.addAsyncListener('file', populatePathsStore);
    traverse.event.addAsyncListener('dir', () => {});
    await traverse.runAsync();
    const pathsStore = PathsStore.getInstance();
    pathsStore.eachPath(async ({ uri, preferredIntents, itemIntents }) => {
      const page = await Page({
        distRootDir,
        uriPath: uri,
        preferredIntents,
        itemIntents,
        pathsStore,
      });

      if (page) {
        await page.toDist();
      }
    });
  } catch (err) {
    log.error(err);
  }
}

main();
