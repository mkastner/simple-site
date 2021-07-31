const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const FastGlob = require('fast-glob');
const childDirectoriesWithIntentFiles = require('../utils/child-directories-with-intent-files.js');
const Path = require('path-extra');
const log = require('mk-log');
const buildPathContent = require('../utils/build-path-content.js');
const writeDistAssets = require('../utils/write-dist-assets.js');
const writeCompressFile = require('../utils/write-compress-file.js');
const buildAsset = require('../utils/build-asset.js');
const srcRootDir = Path.resolve('src');
const distRootDir = Path.resolve('dist');

async function buildHashedPageAssets(page) {
  const distRootDir = 'dist';
  const cssRegex = /"(.*?\.css)"/gim;
  const jsRegex = /"(.*?-script\.js)"/gim;
  const svgRegex = /((?:"|,)\s*(\/.*?\.svg))/gim;
  const woffRegex = /href="(.*?\.woff)"/gim;
  const justCopyRegex = /src="(\/.*?.(jp(e?)g|png|gif|ico))"/gim;

  log.debug(justCopyRegex);

  const matchedCssUris = [...page.matchAll(cssRegex)].map((match) => {
    return match[1];
  });
  const matchedJsUris = [...page.matchAll(jsRegex)].map((match) => {
    return match[1];
  });
  const matchedWoffUris = [...page.matchAll(woffRegex)].map((match) => {
    return match[1];
  });
  const matchedSvgUris = [...page.matchAll(svgRegex)].map((match) => {
    return match[2];
  });
  const matchedJustCopyUris = [...page.matchAll(justCopyRegex)].map((match) => {
    return match[1];
  });

  //matchedJustCopyUris.push('/fonts');

  log.debug('matchedCssUris     \n', matchedCssUris);
  log.debug('matchedJsUris      \n', matchedJsUris);
  log.debug('matchedSvgUris     \n', matchedSvgUris);
  log.debug('matchedJustCopyUris\n', matchedJustCopyUris);

  let finalResultPage = page;

  for (let i = 0, l = matchedCssUris.length; i < l; i++) {
    try {
      const assetUriPath = matchedCssUris[i];
      buildAsset(assetUriPath).writeCss();
      const checkedUriPath = await writeDistAssets({
        distRootDir,
        uriPath: assetUriPath,
      }).fromFile();
      finalResultPage = finalResultPage.replace(assetUriPath, checkedUriPath);
    } catch (err) {
      log.error(err);
    }
  }

  for (let i = 0, l = matchedJsUris.length; i < l; i++) {
    try {
      const assetUriPath = matchedJsUris[i];
      buildAsset(assetUriPath).writeJs();
      const checkedUriPath = await writeDistAssets({
        distRootDir,
        uriPath: assetUriPath,
      }).fromFile();
      finalResultPage = finalResultPage.replace(assetUriPath, checkedUriPath);
    } catch (err) {
      log.error(err);
    }
  }
  for (let i = 0, l = matchedSvgUris.length; i < l; i++) {
    try {
      const assetUriPath = matchedSvgUris[i];
      buildAsset(assetUriPath).writeSvg();
      const hashedUriPath = await writeDistAssets({
        distRootDir,
        uriPath: assetUriPath,
      }).fromFile();
      finalResultPage = finalResultPage.replace(assetUriPath, hashedUriPath);
    } catch (err) {
      log.error(err);
    }
  }
  for (let i = 0, l = matchedWoffUris.length; i < l; i++) {
    try {
      const assetUriPath = matchedWoffUris[i];
      buildAsset(assetUriPath).justCopy();
    } catch (err) {
      log.error(err);
    }
  }
  for (let i = 0, l = matchedJustCopyUris.length; i < l; i++) {
    try {
      const assetUriPath = matchedJustCopyUris[i];
      buildAsset(assetUriPath).justCopy();
    } catch (err) {
      log.error(err);
    }
  }
  return finalResultPage;
}

async function traverse(rootDir, uriPath) {
  try {
    const parentDir = Path.join(rootDir, uriPath);
    const distDir = Path.join(distRootDir, uriPath);
    await fsExtra.ensureDir(distDir);

    const buildPathContentResult = await buildPathContent(srcRootDir, uriPath);

    const pages = await buildPathContentResult.forProduction();

    for (let i = 0, l = pages.length; i < l; i++) {
      const page = pages[i].page;
      const buildPath = pages[i].buildPath || uriPath;
      const pageWithHashedAssets = await buildHashedPageAssets(page);

      const htmlTargetPath = Path.join(distRootDir, `${buildPath}.html`);

      log.info('**************** htmlTargetPath', htmlTargetPath);

      await fs.writeFile(htmlTargetPath, pageWithHashedAssets, 'utf8');
      await writeCompressFile(htmlTargetPath, pageWithHashedAssets, 'gz');
      await writeCompressFile(htmlTargetPath, pageWithHashedAssets, 'br');
    }

    const childDirs = childDirectoriesWithIntentFiles(parentDir);

    log.info('childDirs', childDirs);

    for (let i = 0, l = childDirs.length; i < l; i++) {
      const childDirName = childDirs[i];
      const childUriPath = Path.join(uriPath, childDirName);
      traverse(rootDir, childUriPath);
    }
  } catch (err) {
    log.error(err);
  }
}

function main() {
  traverse(srcRootDir, '/');
}

main();
