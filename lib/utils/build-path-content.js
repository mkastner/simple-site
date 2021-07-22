const requireModule = require('./require-module.js');
const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
const Path = require('path');
const { merge } = require('webpack-merge');
const fs = require('fs').promises;
const log = require('mk-log');
const movePathDown = require('./move-path-down.js');
const handlebarsGlobalHelpers = require('./handlebars/helpers.js');
const Handlebars = require('handlebars');
const FastGlob = require('fast-glob');
//Handlebars.registerHelper(handlebarsHelpers);

markdown.use(markdownItAttrs);

async function loadFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    return fileContent;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;
    }
    log.error(err);
    throw new Error(err);
  }
}

async function loadPreferredFile(basePath, extension) {
  const extensionPath = basePath + extension;

  let loadedFile = await loadFile(extensionPath);
  if (loadedFile || `${loadedFile}`.trim() === '') return loadedFile;

  const extensionIndexPath = Path.join(basePath, 'index' + extension);
  return await loadFile(extensionIndexPath);
}

function moduleLoaderRequire(basePath, extension) {
  const requirePath = basePath + extension;
  const requiredModule = requireModule(requirePath);
  if (requiredModule) return requiredModule;
  const requireIndexPath = Path.join(basePath, 'index' + extension);
  return requireModule(requireIndexPath);
}

async function checkForMatchedLoopLoader(fullPath) {
  try {
    // reqPath e.g.: /awards/fmh-award/2021

    // extract parent dir i.e.:
    // /awards/fmh-award/
    const parentDir = Path.dirname(fullPath);

    const globLoaderPattern = Path.join(parentDir, '*-loader.js');

    const loaderFilePaths = await FastGlob(globLoaderPattern);
    
    log.info('globLoaderPattern ^^^^^^^^^^^^^^^^^^^^', globLoaderPattern);

    log.info('loaderFilePaths   ^^^^^^^^^^^^^^^^^^^^', loaderFilePaths);

    for (let i = 0, l = loaderFilePaths.length; i < l; i++) {
      const loaderFilePath = loaderFilePaths[i];
      // loaderFilePath is full path
     
      const loaderModule = requireModule(loaderFilePath);
      // check if the loader module has implemented
      // a loopName property and a
      // matchesLoopPath function
      // which means it's considered a loop loader then check
      // if it matches the current path
      log.info('loaderFilePath', loaderFilePath);
      log.info('loaderModule', loaderModule);
      if (loaderModule.loopName && loaderModule.matchesLoopPath(fullPath)) {
        return loaderModule;
      }
    }
    return null;
  } catch (err) {
    log.error(err);
  }
}

async function forBoth(viewsDir, reqPath, injectFullPath = () => {}) {
  try {
    let loadedMenu;
    let loadedLayout;
    let loadedTemplate;
    let loadedMd;
    let loadedMeta;
    let loadedData;
    let loadedConfig;
    let dataLoader;
    let mergedHandlebarsHelpers = merge({}, handlebarsGlobalHelpers);
    let paths = [];

    const MaxPathRecursions = 10;
    let countRecursions = 0;

    movePathDown(reqPath, 0, async (downPath) => {
      const fullPath = Path.join(viewsDir, downPath);
      paths.push(fullPath);
      countRecursions += 1;
      if (countRecursions > MaxPathRecursions) {
        throw new Error(`too many recursions: ${countRecursions}`);
      }
    });

    for (let i = 0, l = paths.length; i < l; i++) {
      const path = paths[i];
      const fullPath = await injectFullPath(path);
      log.info('=============> fullPath', fullPath);
      paths.push(fullPath);

      loadedMenu =
        (await loadPreferredFile(fullPath, '-menu.json')) || loadedMenu;
      loadedLayout =
        (await loadPreferredFile(fullPath, '-layout.handlebars')) ||
        loadedLayout;
      loadedTemplate =
        (await loadPreferredFile(fullPath, '.hbs')) || loadedTemplate;
      loadedMeta =
        (await loadPreferredFile(fullPath, '-meta.json')) || loadedMeta;
      loadedConfig =
        (await loadPreferredFile(fullPath, '-config.json')) || loadedConfig;
      loadedMd = (await loadPreferredFile(fullPath, '.md')) || loadedMd;

      loadedData =
        (await loadPreferredFile(fullPath, '-data.json')) || loadedData;
      const DataLoader = moduleLoaderRequire(fullPath, '-loader.js');
      if (DataLoader) {
        dataLoader = (await DataLoader.load()) || dataLoader;
      }

      const handlebarsHelpers = moduleLoaderRequire(
        fullPath,
        '-handlebars-helpers.js'
      );
      if (handlebarsHelpers) {
        mergedHandlebarsHelpers = merge(
          mergedHandlebarsHelpers,
          handlebarsHelpers
        );
      }
    }

    const handlebars = Handlebars.create();
    handlebars.registerHelper(mergedHandlebarsHelpers);

    if (!loadedMenu)
      loadedMenu = `{ "error": "Could not find menu file for path ${reqPath}" }`;
    if (!loadedLayout)
      loadedLayout = `Could not find layout file for path ${reqPath} {{{body}}}`;
    if (!loadedTemplate)
      loadedTemplate = `Could not find template file for path ${reqPath}`;
    if (!loadedMd)
      loadedMd = `Could not find markdown file for path ${reqPath}`;
    if (!loadedMeta)
      loadedMeta = `{ "error": "Could not find meta file for path ${reqPath}" }`;
    if (!loadedConfig)
      loadedConfig = `{ "error": "Could not find config file for path ${reqPath}" }`;

    const htmlText = markdown.render(loadedMd);
    const meta = JSON.parse(loadedMeta);
    const menu = JSON.parse(loadedMenu);
    const config = JSON.parse(loadedConfig);

    const compiledTemplate = handlebars.compile(loadedTemplate);
    const compiledLayout = handlebars.compile(loadedLayout);

    // result can be single occurance or loop
    const pages = [];

    if (dataLoader) {
      // can load none, one or more items
      // dataLoader must implement #result(fnc(data, { itemData, buildReqPath } )
      await dataLoader.result((data, { itemData, buildReqPath }) => {
        //log.info('dataLoader', dataLoader);
        // if it's not loop, itemData and data are identical
        // if it is a loop, then itemData is a collection item

        const template = compiledTemplate({
          htmlText,
          menu,
          meta,
          config,
          data,
          itemData,
          reqPath,
        });
        //log.info('template', template);
        const page = compiledLayout({
          body: template,
          menu,
          meta,
          config,
          data,
          itemData,
          reqPath,
        });
        pages.push({ page, status: 200, buildPath: buildReqPath });
      }, reqPath);
    } else {
      const data = loadedData;
      const template = compiledTemplate({
        htmlText,
        menu,
        meta,
        data,
        reqPath,
      });
      const page = compiledLayout({
        body: template,
        menu,
        meta,
        data,
        reqPath,
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
      async function injectResourcePath(fullPath) {
        log.info('fullPath', fullPath);
        const matchedLoopDataLoader = await checkForMatchedLoopLoader(fullPath);
        if (!matchedLoopDataLoader) return fullPath;

        log.info('matchedLoopDataLoader', matchedLoopDataLoader);
        log.info('fullPath             ', fullPath);

        return matchedLoopDataLoader.replaceMutablePathSegment(fullPath);
      }
      return forBoth(viewsDir, reqPath, injectResourcePath);
    },
    forProduction() {
      async function injectResourcePath(fullPath) {
        return fullPath;
      }
      return forBoth(viewsDir, reqPath, injectResourcePath);
    },
  };
};
