const requireModule = require('./require-module.js');
const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
const Path = require('path');
const log = require('mk-log');
const movePathDown = require('./move-path-down.js');
const FastGlob = require('fast-glob');
const PathsStore = require('./paths-store.js');
const Handlebars = require('handlebars');
const { merge } = require('webpack-merge');

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

async function forBoth(viewsDir, reqPath) {
  try {
    let pathsStore = PathsStore.getInstance();
    await movePathDown(reqPath, 0, async (downPath) => {
      const absLocalDirPath = Path.join(viewsDir, downPath);
      await pathsStore.putAsync(downPath, absLocalDirPath);
    });

    log.info('#################### reqPath', reqPath);

    const intents = pathsStore.pull(reqPath);

    const htmlText = markdown.render((await intents.get('text')) || '');
    const meta = (await intents.get('meta')) || {};
    const menu = (await intents.get('menu')) || {};
    const config = await intents.get('config' || {});
    const hbsHelpers = await intents.get('hbshelpers');
    const compiledTemplate = await intents.get('template');
    const compiledLayout = await intents.get('layout');
    const dataLoader = await intents.get('loader');
    const index = await intents.get('index');
    // result can be single occurance or loop

    Handlebars.registerHelper(hbsHelpers);

    const pages = [];

    const commonArgs = {
      index,
      config,
      menu,
      meta,
      pathsStore,
      reqPath,
    };

    if (dataLoader) {
      // can load none, one or more items
      // dataLoader must implement #result(fnc(data, { itemData, buildReqPath } )

      await dataLoader.result(async (data, { itemData, buildReqPath }) => {
        // if it's not loop, itemData and data are identical
        // if it is a loop, then itemData is a collection item
        //log.info('itemData      ____________________', itemData);

        log.info('buildReqPath', buildReqPath);

        const template = await compiledTemplate(
          merge(commonArgs, {
            htmlText,
            itemData, // this is the data for loop/collection item
            data,
          })
        );
        const page = await compiledLayout({
          body: template,
          itemData,
          data,
        });
        let buildPath = buildReqPath;
        if (index) {
          buildPath = Path.join(buildPath, 'index');
        }
        pages.push({ page, status: 200, buildPath });
      }, reqPath);
    } else {
      const template = await compiledTemplate(
        merge(commonArgs, {
          htmlText,
        })
      );
      const page = await compiledLayout(merge(commonArgs, { body: template }));
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
