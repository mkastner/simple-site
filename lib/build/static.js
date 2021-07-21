const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const path = require('path-extra');
const siteName = process.env.SIMPLESITE_NAME;
const log = require('mk-log');
const buildPathContent = require('../utils/build-path-content.js');
const writeDistAssets = require('../utils/write-dist-assets.js');
const writeCompressFile = require('../utils/write-compress-file.js');
const buildAsset = require('../utils/build-asset.js');
const srcRootDir = path.resolve(path.join('custom', siteName, 'src'));
const distRootDir = path.resolve(path.join('custom', siteName, 'dist'));

async function buildHashedPageAssets(page) {
  const distRootDir = `custom/${siteName}/dist`;
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
      log.info('justCopy URI', assetUriPath);
      buildAsset(assetUriPath).justCopy();
    } catch (err) {
      log.error(err);
    }
  }
  return finalResultPage;
}

async function traverse(rootDir, parentPath) {
  try {
    const parentDir = path.join(rootDir, parentPath);
    log.info('rootDir', rootDir);

    const distDir = path.join(distRootDir, parentPath);
    await fsExtra.ensureDir(distDir);

    const names = await fs.readdir(parentDir);
    log.info('parentDir names', names);
    for (let i = 0, l = names.length; i < l; i++) {
      const name = names[i];
      const childPath = path.join(parentPath, name);
      const absChildPath = path.join(parentDir, name);
      const stat = await fs.stat(absChildPath);

      if (stat.isFile() && childPath.match(/\.md$/)) {
        // remove md extension
        const basePath = childPath.replace(/\.md$/, '');

        log.info('childPath', childPath);
        //log.info('basePath ', basePath);

        // don't check on index md
        //if (basePath !== 'index') {
        const buildPathContentResult = buildPathContent(srcRootDir, basePath);

        const pages = await buildPathContentResult.forProduction();

        for (let i = 0, l = pages.length; i < l; i++) {
          const page = pages[i].page;
          const buildPath = pages[i].buildPath || basePath;
          const pageWithHashedAssets = await buildHashedPageAssets(page);

          const htmlTargetPath = path.join(distRootDir, `${buildPath}.html`);

          await fs.writeFile(htmlTargetPath, pageWithHashedAssets, 'utf8');
          await writeCompressFile(htmlTargetPath, pageWithHashedAssets, 'gz');
          await writeCompressFile(htmlTargetPath, pageWithHashedAssets, 'br');
        }
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
