const requireModule = require('./require-module.js');
const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
const Path = require('path');
const log = require('mk-log');
const movePathDown = require('./move-path-down.js');
const FastGlob = require('fast-glob');
const PathsStore = require('./paths-store.js');
const Handlebars = require('handlebars');
const globIntentPatterns = require('./glob-intent-patterns.js');
const globFilePaths = require('./glob-file-paths.js');

markdown.use(markdownItAttrs);

async function checkForMatchedLoopLoader(absLocalPath) {
  try {
    // reqPath e.g.: /awards/fmh-award/2021

    // extract parent dir i.e.:
    // /awards/fmh-award/
    const parentDir = Path.dirname(absLocalPath);
    const globLoaderPattern = Path.join(parentDir, '*.loader.js');
    const loaderFilePaths = await FastGlob(globLoaderPattern);

    for (let i = 0, l = loaderFilePaths.length; i < l; i++) {
      const loaderFilePath = loaderFilePaths[i];
      // loaderFilePath is full path
      const loaderModule = requireModule(loaderFilePath);
      // check if the loader module has implemented
      // a loopName property and a
      // matchesLoopPath function
      // which means it's considered a loop loader then check
      // if it matches the current path
      if (loaderModule.loopName && loaderModule.matchesLoopPath(absLocalPath)) {
        return loaderModule;
      }
    }
    return null;
  } catch (err) {
    log.error(err);
  }
}

//async function forBoth(viewsDir, reqPath, injectFullPath = () => {}) {
async function forBoth(viewsDir, reqPath) {
  try {
    let pathsStore = PathsStore.getInstance();
    await movePathDown(reqPath, 0, async (downPath) => {
      log.info('reqPath', reqPath);

      const absLocalDirPath = Path.join(viewsDir, downPath);

      log.info('absLocalDirPath', absLocalDirPath);
      const globLoaderPatterns = globFilePaths(
        absLocalDirPath,
        globIntentPatterns
      );

      // check if directory has intent files
      // stop following directories which only
      // contain resources

      const globbedIntentFiles = FastGlob.sync(globLoaderPatterns);

      log.info(`globbedIntentFiles ====> "${reqPath}"`, globbedIntentFiles);

      //if (globbedIntentFiles.length >= 1) {
      await pathsStore.putAsync(downPath, absLocalDirPath);
      //}
    });

    //log.info('pathsStore.paths', pathsStore.paths);

    //pathsStore = PathsStore.getInstance();

    const intents = pathsStore.pull(reqPath);
    const htmlText = markdown.render((await intents.get('text')) || '');
    const meta = (await intents.get('meta')) || {};
    const menu = (await intents.get('menu')) || {};
    const config = await intents.get('config' || {});
    const hbsHelpers = await intents.get('hbshelpers');
    const compiledTemplate = await intents.get('template');
    const compiledLayout = await intents.get('layout');
    const dataLoader = await intents.get('loader');
    // result can be single occurance or loop

    Handlebars.registerHelper(hbsHelpers);

    const pages = [];

    if (dataLoader) {
      // can load none, one or more items
      // dataLoader must implement #result(fnc(data, { itemData, buildReqPath } )
      await dataLoader.result(async (data, { itemData, buildReqPath }) => {
        //log.info('dataLoader', dataLoader);
        // if it's not loop, itemData and data are identical
        // if it is a loop, then itemData is a collection item

        const template = await compiledTemplate({
          htmlText,
          menu,
          meta,
          config,
          data,
          itemData, // this is the data for loop/collection item
          reqPath,
          pathsStore,
        });
        const page = await compiledLayout({
          body: template,
          menu,
          meta,
          config,
          data,
          itemData,
          reqPath,
          pathsStore,
        });
        pages.push({ page, status: 200, buildPath: buildReqPath });
      }, reqPath);
    } else {
      const template = await compiledTemplate({
        htmlText,
        menu,
        meta,
        reqPath,
        pathsStore,
      });
      const page = await compiledLayout({
        body: template,
        menu,
        meta,
        reqPath,
        pathsStore,
      });
      pages.push({ page, status: 200 });
    }

    return pages;
  } catch (err) {
    log.error(err);
    return null;
  }
}

module.exports = function buildPathContent(viewsDir, reqPath) {
  return {
    forDevelopment() {
      async function injectResourcePath(absLocalPath) {
        const matchedLoopDataLoader = await checkForMatchedLoopLoader(
          absLocalPath
        );
        if (!matchedLoopDataLoader) return absLocalPath;
        return matchedLoopDataLoader.replaceMutablePathSegment(absLocalPath);
      }
      return forBoth(viewsDir, reqPath, injectResourcePath);
    },
    forProduction() {
      async function injectResourcePath(absLocalPath) {
        return absLocalPath;
      }
      return forBoth(viewsDir, reqPath, injectResourcePath);
    },
  };
};
