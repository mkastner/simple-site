const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
const path = require('path');
const fs = require('fs').promises;
const log = require('mk-log');
const movePathUp = require('./move-path-up');
const handlebarsHelpers = require('./handlebars/helpers');
const Handlebars = require('handlebars');

Handlebars.registerHelper(handlebarsHelpers);

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

  //log.info('extensionPath', extensionPath);

  const extensionIndexPath = path.join(basePath, 'index' + extension);
  log.info('extensionIndexPath', extensionIndexPath);
  return await loadFile(extensionIndexPath);
}

function dataLoaderRequire(basePath, extension) {
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
  let loadedMenu;
  let loadedLayout;
  let loadedTemplate;
  let loadedMd;
  let loadedMeta;

  let paths = [];

  const MaxPathRecursions = 10;
  let countRecursions = 0;
  movePathUp(reqPath, (p) => {
    const fullPath = path.join(viewsDir, p);
    paths.push(fullPath);
    countRecursions += 1;
    if (countRecursions > MaxPathRecursions) {
      throw new Error(`too many recursions: ${countRecursions}`);
    }
  });

  for (let i = 0, l = paths.length; i < l; i++) {
    const fullPath = paths[i];

    if (!loadedMenu) {
      loadedMenu = await loadPreferredFile(fullPath, '-menu.json');
    }
    if (!loadedLayout) {
      loadedLayout = await loadPreferredFile(fullPath, '-layout.handlebars');
    }
    if (!loadedTemplate) {
      loadedTemplate = await loadPreferredFile(fullPath, '.hbs');
    }
    if (!loadedMeta) {
      loadedMeta = await loadPreferredFile(fullPath, '-meta.json');
    }
    if (!loadedMd) {
      loadedMd = await loadPreferredFile(fullPath, '.md');
    }
    if (loadedMeta && loadedMd && loadedLayout && loadedTemplate) {
      break;
    }
  }

  let error = '';
  if (!loadedMenu) error += `Could not find menu file for path ${reqPath}`;
  if (!loadedLayout) error += `Could not find layout file for path ${reqPath}`;
  if (!loadedTemplate)
    error += `Could not find template file for path ${reqPath}`;
  if (!loadedMd) error += `Could not find markdown file for path ${reqPath}`;
  if (!loadedMeta) error += `Could not find meta file for path ${reqPath}`;

  if (error) {
    return { page: 'error', status: { code: 404, message: error } };
  }

  const dataLoader = dataLoaderRequire(paths[0], '-loader.js');
  let data;

  if (dataLoader) {
    data = await dataLoader();
  }
  const htmlText = markdown.render(loadedMd);
  const meta = JSON.parse(loadedMeta);
  const menu = JSON.parse(loadedMenu);

  const compiledTemplate = Handlebars.compile(loadedTemplate);
  const compiledLayout = Handlebars.compile(loadedLayout);

  log.info('data', data);

  const template = compiledTemplate({ htmlText, menu, meta, data, reqPath });
  const page = compiledLayout({ body: template, menu, meta, data, reqPath });

  return {
    page,
    status: 200,
  };
};
