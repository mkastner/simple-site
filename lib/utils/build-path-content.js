const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
const path = require('path');
const { merge } = require('webpack-merge');
const fs = require('fs').promises;
const log = require('mk-log');
const movePathDown = require('./move-path-down');
const handlebarsGlobalHelpers = require('./handlebars/helpers');
const Handlebars = require('handlebars');

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

  const extensionIndexPath = path.join(basePath, 'index' + extension);
  return await loadFile(extensionIndexPath);
}

function moduleLoaderRequire(basePath, extension) {
  let requiredModule;
  try {
    const requirePath = basePath + extension;
    requiredModule = require(requirePath);
    return requiredModule;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      log.error(err);
    }
  }
  try {
    const requireIndexPath = path.join(basePath, 'index' + extension);
    requiredModule = require(requireIndexPath);
    return requiredModule;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      log.error(err);
    }
  }
}

module.exports = async function buildPathContent(viewsDir, reqPath) {
  log.info('*************** reqPath', reqPath);

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

  movePathDown(reqPath, 0, (p) => {
    const fullPath = path.join(viewsDir, p);
    paths.push(fullPath);
    countRecursions += 1;
    if (countRecursions > MaxPathRecursions) {
      throw new Error(`too many recursions: ${countRecursions}`);
    }
  });

  for (let i = 0, l = paths.length; i < l; i++) {
    const fullPath = paths[i];

    log.info('fullPath', fullPath);

    loadedConfig =
      (await loadPreferredFile(fullPath, '-config.json')) || loadedMenu;
    loadedMenu =
      (await loadPreferredFile(fullPath, '-menu.json')) || loadedMenu;
    loadedLayout =
      (await loadPreferredFile(fullPath, '-layout.handlebars')) || loadedLayout;
    loadedTemplate =
      (await loadPreferredFile(fullPath, '.hbs')) || loadedTemplate;
    loadedMeta =
      (await loadPreferredFile(fullPath, '-meta.json')) || loadedMeta;
    loadedMd = (await loadPreferredFile(fullPath, '.md')) || loadedMd;

    loadedData =
      (await loadPreferredFile(fullPath, '-data.json')) || loadedData;
    const DataLoader = moduleLoaderRequire(fullPath, '-loader.js');
    if (DataLoader) {
      dataLoader = (await DataLoader()) || dataLoader;
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
  if (!loadedMd) loadedMd = `Could not find markdown file for path ${reqPath}`;
  if (!loadedMeta)
    loadedMeta = `{ "error": "Could not find meta file for path ${reqPath}" }`;

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
    dataLoader.result((data, { itemData, buildReqPath }) => {
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
    const template = compiledTemplate({ htmlText, menu, meta, data, reqPath });
    const page = compiledLayout({ body: template, menu, meta, data, reqPath });
    pages.push({ page, status: 200 });
  }

  return pages;
};
