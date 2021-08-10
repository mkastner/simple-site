const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const Path = require('path-extra');
const log = require('mk-log');
const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
markdown.use(markdownItAttrs);
const writeCompressFile = require('../utils/write-compress-file.js');
const buildAsset = require('../utils/build-asset.js');
const ensureDistPageAssets = require('../utils/ensure-dist-page-assets.js');
const ensureDistPageBasePaths = require('../utils/ensure-dist-page-base-paths.js');
const Handlebars = require('handlebars');

async function buildPageAssets(page) {
  const distRootDir = 'dist';
  const cssRegex = /"(.*?\.css)"/gim;
  // regex rule fetch all js files where
  // basename consists only of letters
  const jsRegex = /"(.*?\.js)"/gim;
  const svgRegex = /((?:"|,)\s*(\/.*?\.svg))/gim;
  const woffRegex = /href="(.*?\.woff)"/gim;
  const justCopyRegex = /src="(\/.*?\.(jp(e?)g|png|gif|ico))"/gim;

  log.debug(justCopyRegex);

  const matchedCssUris = [...page.matchAll(cssRegex)].map((match) => {
    return match[1];
  });

  // don't process frontend js from /dev/ folder
  // because files in that folder are reserved for
  // development only
  const matchedJsUris = [...page.matchAll(jsRegex)]
    .map((match) => {
      return match[1];
    })
    .filter((f) => !f.match(/^\/dev\//));

  const matchedWoffUris = [...page.matchAll(woffRegex)].map((match) => {
    return match[1];
  });
  const matchedSvgUris = [...page.matchAll(svgRegex)].map((match) => {
    return match[2];
  });
  const matchedJustCopyUris = [...page.matchAll(justCopyRegex)].map((match) => {
    return match[1];
  });

  let finalResultPage = page;

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedCssUris,
    distRootDir,
    page: finalResultPage,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).writeCss();
    },
  });

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedJsUris,
    distRootDir,
    page: finalResultPage,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).writeJs();
    },
  });
  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedWoffUris,
    distRootDir,
    page: finalResultPage,
    binary: true,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).writeWoff();
    },
  });
  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedSvgUris,
    distRootDir,
    page: finalResultPage,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).writeSvg();
    },
  });
  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedJustCopyUris,
    distRootDir,
    page: finalResultPage,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).justCopy();
    },
  });
  finalResultPage = ensureDistPageBasePaths(finalResultPage);

  return finalResultPage;
}

module.exports = async function page({
  distRootDir,
  uriPath,
  preferredIntents,
  itemIntents,
  pathsStore,
}) {
  try {
    if (
      itemIntents &&
      itemIntents.has('loader') &&
      itemIntents.get('loader').eachVariant
    ) {
      return false;
    }
    const distBasePath = Path.join(distRootDir, uriPath);
    const distDirPath = Path.dirname(distBasePath);
    await fsExtra.ensureDir(distDirPath);
    const hbshelpers = preferredIntents.get('hbshelpers');
    Handlebars.registerHelper(hbshelpers);

    const menu = preferredIntents.get('menu');
    const meta = preferredIntents.get('meta');
    //const htmlText = markdown.render('');
    const mdText = preferredIntents.get('text');
    const htmlText = markdown.render(mdText);
    const config = preferredIntents.get('config');

    log.info(Array.from(preferredIntents.keys()));

    const template = preferredIntents.get('template')({
      meta,
      menu,
      htmlText,
      config,
      pathsStore,
    });
    const page = preferredIntents.get('layout')({
      body: template,
      meta,
      menu,
      config,
      pathsStore,
    });

    const pageWithAssets = await buildPageAssets(page);

    return {
      toString() {
        return pageWithAssets;
      },
      async toDist() {
        const htmlTargetPath = `${distBasePath}.html`;
        await fs.writeFile(htmlTargetPath, pageWithAssets, 'utf8');
        await writeCompressFile(htmlTargetPath, pageWithAssets, 'gz');
        await writeCompressFile(htmlTargetPath, pageWithAssets, 'br');
      },
    };
  } catch (err) {
    log.error(err);
  }
};