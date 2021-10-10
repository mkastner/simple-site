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
const { merge } = require('webpack-merge');
const hbsGlobalHelpers = require('../utils/handlebars/helpers.js');
const DirLocations = require('../utils/dir-locations.js');
const Handlebars = require('handlebars');

async function buildPageAssets(page) {
  //const distRootDir = Path.basename(DirLocations.dist);
  // take distRootDir from DirLocations.dist.basename
  const cssRegex = /href="(\/.*?\.css)"/gim;
  // regex rule fetch all js files where
  // basename consists only of letters
  const jsRegex = /"(\/.*?\.js)"/gim;
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
    page: finalResultPage,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).writeCss();
    },
  });

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedJsUris,
    page: finalResultPage,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).writeJs();
    },
  });
  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedWoffUris,
    page: finalResultPage,
    binary: true,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).writeWoff();
    },
  });
  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedSvgUris,
    page: finalResultPage,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).writeSvg();
    },
  });
  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedJustCopyUris,
    page: finalResultPage,
    modifier: (assetRootDir) => {
      buildAsset(assetRootDir).justCopy();
    },
  });
  finalResultPage = ensureDistPageBasePaths(finalResultPage);
  return finalResultPage;
}

module.exports = async function page({
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

    const distBasePath = Path.join(DirLocations.dist.absolute, uriPath);
    await fsExtra.ensureDir(DirLocations.dist.absolute);
    const hbsHelpers = preferredIntents.get('hbshelpers');
    const mergedHelpers = merge(hbsGlobalHelpers, hbsHelpers);

    Handlebars.registerHelper(mergedHelpers);

    const menu = preferredIntents.get('menu');
    const meta = preferredIntents.get('meta');
    const mdText = preferredIntents.get('text');
    const htmlText = markdown.render(mdText);
    const config = preferredIntents.get('config');
    const loaderData = preferredIntents.get('loaderData');

    const template = preferredIntents.get('template')({
      meta,
      menu,
      htmlText,
      config,
      pathsStore,
      loaderData,
    });

    const page = preferredIntents.get('layout')({
      body: template,
      meta,
      menu,
      config,
      pathsStore,
      loaderData,
    });

    const pageWithAssets = await buildPageAssets(page);

    return {
      toString() {
        return pageWithAssets;
      },
      async toDist() {
        try {
          const htmlTargetPath = `${distBasePath}.html`;

          await fsExtra.outputFile(htmlTargetPath, pageWithAssets, 'utf8');
          await writeCompressFile(htmlTargetPath, pageWithAssets, 'gz');
          await writeCompressFile(htmlTargetPath, pageWithAssets, 'br');
        } catch (err) {
          log.error(err);
        }
      },
    };
  } catch (err) {
    log.error(err);
  }
};
