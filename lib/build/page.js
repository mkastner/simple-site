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
const HbsGlobalHelpers = require('../utils/handlebars/helpers.js');
const DirLocations = require('../utils/dir-locations.js');
const Handlebars = require('handlebars');
const {
  cssRegex,
  jsRegex,
  svgRegex,
  woffHtmlRegex,
  woffCssRegex,
  justCopyRegex,
} = require('../utils/asset-regex-defs.js');

async function buildPageAssets(page, uriPath) {
  console.log('+++ > buildPageAssets start', uriPath);
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

  const matchedWoffUris = [...page.matchAll(woffHtmlRegex)].map((match) => {
    return match[1];
  });

  const matchedSvgUris = [...page.matchAll(svgRegex)].map((match) => {
    return match[2];
  });

  const matchedJustCopyUris = [...page.matchAll(justCopyRegex)].map((match) => {
    return match[2];
  });

  let finalResultPage = page;

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedCssUris,
    page: finalResultPage,
    modifier: async (assetRootPath) => {
      await buildAsset(assetRootPath).writeCss(async (scssData) => {
        const matchedSvgInScssUris = [...scssData.matchAll(svgRegex)].map(
          (match) => match[2]
        );
        // use absolute paths in scss files
        // to make sure that the scss files
        // are found by the scss compiler
        const scssSvgUris = matchedSvgInScssUris.map((uri) => {
          return uri;
        });
        const modifiedScssWithSvgUris = await ensureDistPageAssets({
          matchedUris: scssSvgUris,
          page: scssData,
          modifier: async (assetRootDir) => {
            //log.info('assetRootDir', assetRootDir);
            await buildAsset(assetRootDir).writeSvg();
          },
        });

        const matchedWoffInCssUris = [
          ...modifiedScssWithSvgUris.matchAll(woffCssRegex),
        ].map((match) => match[1]);
        // use absolute paths in scss files
        // to make sure that the scss files
        // are found by the scss compiler

        const scssWoffUris = matchedWoffInCssUris.map((uri) => {
          return uri;
        });

        // extracting and writing woff fonts found in scss
        const modifiedScssWithWoffUris = await ensureDistPageAssets({
          matchedUris: scssWoffUris,
          binary: true,
          page: modifiedScssWithSvgUris,
          modifier: async (assetRootDir) => {
            await buildAsset(assetRootDir).writeWoff();
          },
        });

        log.info('modifiedScssWithWoffUris', modifiedScssWithWoffUris.length);

        return modifiedScssWithWoffUris;
        //return Promise.resolve(scssData);
      });
    },
  });

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedWoffUris,
    page: finalResultPage,
    modifier: async (assetRootPath) => {
      await buildAsset(assetRootPath).writeWoff();
    },
  });

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedJsUris,
    page: finalResultPage,
    modifier: async (assetRootPath) => {
      await buildAsset(assetRootPath).writeJs();
    },
  });

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedSvgUris,
    page: finalResultPage,
    modifier: async (assetRootPath) => {
      await buildAsset(assetRootPath).writeSvg();
    },
  });

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedJustCopyUris,
    page: finalResultPage,
    modifier: async (assetRootPath) => {
      await buildAsset(assetRootPath).justCopy();
    },
  });

  finalResultPage = ensureDistPageBasePaths(finalResultPage);
  // log.info('========= finalResultPage', finalResultPage);
  console.log('--- > buildPageAssets end', uriPath);
  return finalResultPage;
}

module.exports = async function page({
  uriPath,
  preferredIntents,
  itemIntents,
  partials,
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
    const hbsGlobalHelpers = HbsGlobalHelpers();
    const mergedHelpers = merge(hbsGlobalHelpers, hbsHelpers || {});

    Handlebars.registerPartial(partials);
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

    const pageWithAssets = await buildPageAssets(page, uriPath);

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
