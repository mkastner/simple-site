const markdown = new require('markdown-it')({html: true});
const markdownItAttrs = require('markdown-it-attrs');
const path = require('path');
const fs = require('fs').promises;
const log = require('mk-log');
const movePathUp = require('./move-path-up');

markdown.use(markdownItAttrs);

async function loadFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');  
    return fileContent;
  } catch(err) {
    if (err.code === 'ENOENT') {
      return null; 
    }
    log.error(err);
    throw new Error(err); 
  }
}

async function loadPreferredFile(basePath, extension) {
  const extensionPath = basePath + extension;
  let loadedTemplate = await loadFile(extensionPath);
  if (loadedTemplate) return loadedTemplate;
    
  const extensionIndexPath = path.join(basePath, 'index' + extension);
  return await loadFile(extensionIndexPath);
} 

function removeStartingSlash(path) {
  if (path && (path.indexOf('/') === 0)) {
    return path.substring(1);
  }
  return path;
}

async function findPreferredTemplatePath(basePath, p) {
  const extension = '.hbs';
  const extensionPath = basePath + extension;
  try {
    const templateExistsAtPath = await fs.stat(extensionPath);
    if (templateExistsAtPath) return p;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log.error(err);
      throw new Error(err); 
    }
  }
  
  const indexExtensionPath = path.join(basePath, 'index' + extension);
  try { 
    const indexTemplateExistsAtPath = await fs.stat(indexExtensionPath);
    if (indexTemplateExistsAtPath) return path.join(p, 'index'); 
  } catch (err) {
    if (err.code !== 'ENOENT') {
      log.error(err);
      throw new Error(err); 
    }
    return null; 
  }
} 

module.exports = async function buildPathContent(viewsDir, reqPath) {
  
  let templatePath;
  let loadedMd;
  let loadedMeta;

  let paths = [];

  const MaxPathRecursions = 10;
  let countRecursions = 0;
  movePathUp(reqPath, (p) => {
    log.info('p', p);
    const basePath = path.join(viewsDir, p);
    paths.push({basePath, p}); 
    countRecursions += 1;
    if (countRecursions > MaxPathRecursions) {
      throw new Error(`too many recursions: ${countRecursions}`); 
    }
  });

  for (let i = 0, l = paths.length; i < l; i++) {
    const {basePath, p} = paths[i];
    if (!templatePath) { 
      templatePath = await findPreferredTemplatePath(basePath, p);
    }
    if (!loadedMeta) { 
      loadedMeta = await loadPreferredFile(basePath, '-meta.json');
    }
    if (!loadedMd) { 
      loadedMd = await loadPreferredFile(basePath, '.md');
    }
    if (loadedMeta && loadedMd && templatePath) {
      break; 
    } 
  }
  
  let error = '';
  if (!templatePath) error += `Could not find template file for path ${reqPath}`;  
  if (!loadedMd) error += `Could not find markdown file for path ${reqPath}`;  
  if (!loadedMeta) error += `Could not find meta file for path ${reqPath}`;  

  if (error) {
    return { templatePath: 'error', status: { code: 404, message: error } } 
  } 

  const htmlText = markdown.render(loadedMd);
  const meta = JSON.parse(loadedMeta);

  return {
    templatePath: removeStartingSlash(templatePath), htmlText, meta, status: 200
  };

}
