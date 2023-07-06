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
  woffRegex,
  justCopyRegex,
} = require('../utils/asset-regex-defs.js');
async function buildPageAssets(page) {
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
    return match[2];
  });

  let finalResultPage = page;

  finalResultPage = await ensureDistPageAssets({
    matchedUris: matchedCssUris,
    page: finalResultPage,
    modifier: async (assetRootPath) => {
      await buildAsset(assetRootPath).writeCss(async (scssData) => {
        const matchedScssSvgUris = [...scssData.matchAll(svgRegex)].map(
          (match) => match[2]
        );
        // use absolute paths in scss files
        // to make sure that the scss files
        // are found by the scss compiler
        //log.info('========= matchedScssSvgUris', matchedScssSvgUris);
        //const assetRootDir = Path.dirname(assetRootPath);
        //log.info('========= assetRootPath', assetRootPath);
        //log.info('========= assetRootDir', assetRootDir);
        const scssSvgUri = matchedScssSvgUris.map((uri) => {
          return uri;
        });
        //log.info('========= scssSvgUris', scssSvgUri);
        const modifiedScssWithSvgUris = await ensureDistPageAssets({
          matchedUris: scssSvgUri,
          page: scssData,
          modifier: (assetRootDir) => {
            buildAsset(assetRootDir).writeSvg();
          },
        });
        //log.info('========= modifiedScssSvgUris', modifiedScssWithSvgUris);
        //log.info('>>>>>>>>>>>> mofifiedScssSvgUris', await mofifiedScssWithSvgUris);

        //log.info('========= scssData', scssData);
        return modifiedScssWithSvgUris;
        //return Promise.resolve(scssData);
      });
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
  // log.info('========= finalResultPage', finalResultPage);
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

    const pageWithAssets = await buildPageAssets(page);

    //log.info('========= pageWithAssets', pageWithAssets);

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
