const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path-extra');
const siteName = process.env.SIMPLESITE_NAME;
const log = require('mk-log');
const buildPathContent = require('../utils/build-path-content');
const compressToFile = require('../utils/compress-to-file');
const writeCompressFile = require('../utils/write-compress-file');
const buildCss = require('../utils/build-css');
const srcRootDir = path.resolve(path.join('custom', siteName, 'src'));
const distRootDir = path.resolve(path.join('custom', siteName, 'dist'));
const iteratorsDir = path.join(distRootDir, 'lib');


log.info('srcRootDir', srcRootDir);

const iteratorsCache = {};

function requireIterator(iteratorName) {
  try {
    let iterator = iteratorsCache[iteratorName];
    if (!iterator) {
      iterator = require(iteratorsDir);
      iteratorsCache[iteratorName] = iterator; 
    }
  } catch (err) {
    log.error(err); 
  }

}

async function buildHashedPageAssets(page) {

    page.replace(/"(.*?\.css)"/igm, async (match, urlPath) => { 
      try {
      buildCss(urlPath);
      const contentPath = path.join(`custom/${siteName}/dist`, urlPath); 
      await compressToFile(contentPath, 'gz', true).fromFile(); 
      //let baseName = path.basename(linkPath, '.css');
      //log.info('baseName', baseName);
    } catch (err) {
      log.error(err);
    } 
  }); 
}



async function traverse(rootDir, parentPath) {
  try {
    const parentDir = path.join(rootDir, parentPath);
    log.info('parentDir', parentDir);

    const distDir = path.join(distRootDir, parentPath);
    await fsExtra.ensureDir(distDir);

    const names = await fs.readdir(parentDir); 
    for (let i = 0, l = names.length; i < l; i++) {
      const name = names[i];
      const childPath = path.join(parentPath, name);
      const absChildPath = path.join(parentDir, name);
      const stat = await fs.stat(absChildPath);
      if (stat.isFile() && childPath.match(/\.md$/)) {
        // remove md extension
        const basePath = childPath.replace(/\.md$/, '');

        log.info('basePath:', basePath); 

        //log.info('childPath', childPath);
        //log.info('basename ', basePath);

        // don't check on index md 
        //if (basePath !== 'index') {
        const {page, status} = await buildPathContent(srcRootDir, basePath); 
        
        await buildHashedPageAssets(page);

        const htmlTargetPath = path.join(distRootDir, `${basePath}.html`);

        //log.info('targetPath', targetPath);
        
        await fs.writeFile(htmlTargetPath, page, 'utf8');

        await writeCompressFile(htmlTargetPath, page, 'gz');  
        await writeCompressFile(htmlTargetPath, page, 'br');  
      
      }
      if (stat.isDirectory()) {
        traverse(rootDir, childPath); 
      } 
    } 
  } catch (err) {
    log.error(err);
  } 
}

function main() {
  traverse(srcRootDir, '/');
}

main();
