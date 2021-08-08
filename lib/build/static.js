const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const Path = require('path-extra');
const log = require('mk-log');
const markdown = new require('markdown-it')({ html: true });
const markdownItAttrs = require('markdown-it-attrs');
markdown.use(markdownItAttrs);
const writeCompressFile = require('../utils/write-compress-file.js');
const buildAsset = require('../utils/build-asset.js');
const traverseDirectory = require('../utils/traverse-directory.js');
const globIntentPatterns = require('../utils/glob-intent-patterns.js');
const ensureDistPageAssets = require('../utils/ensure-dist-page-assets.js');
const ensureDistPageBasePaths = require('../utils/ensure-dist-page-base-paths.js');
const PathsStore = require('../utils/paths-store.js');
const srcRootDir = Path.resolve('src');
const distRootDir = Path.resolve('dist');
const Handlebars = require('handlebars');

async function buildHashedPageAssets(page) {
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

  //matchedJustCopyUris.push('/fonts');

  log.debug('matchedCssUris     \n', matchedCssUris);
  log.debug('matchedJsUris      \n', matchedJsUris);
  log.debug('matchedWoffUris    \n', matchedWoffUris);
  log.debug('matchedSvgUris     \n', matchedSvgUris);
  log.debug('matchedJustCopyUris\n', matchedJustCopyUris);

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
  finalResultPage = ensureDistPageBasePaths(finalResultPage);

  return finalResultPage;
}

async function buildPage({
  distRootDir,
  uriPath,
  preferredIntents,
  itemIntents,
  pathsStore,
}) {
  try {
    if (itemIntents.has('loader') && itemIntents.get('loader').eachVariant) {
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

    const pageWithHashedAssets = await buildHashedPageAssets(page);

    const htmlTargetPath = `${distBasePath}.html`;

    await fs.writeFile(htmlTargetPath, pageWithHashedAssets, 'utf8');
    await writeCompressFile(htmlTargetPath, pageWithHashedAssets, 'gz');
    await writeCompressFile(htmlTargetPath, pageWithHashedAssets, 'br');
  } catch (err) {
    log.error(err);
  }
}

async function populatePathsStore(file) {
  try {
    const pathsStore = PathsStore.getInstance();
    await pathsStore.putAsync(srcRootDir, file);
  } catch (err) {
    log.error(err);
  }
}

async function main() {
  //traverse(srcRootDir, '/');
  try {
    const traverse = await traverseDirectory(srcRootDir);
    traverse.fileGlobPatterns = globIntentPatterns;
    traverse.event.addAsyncListener('file', populatePathsStore);
    traverse.event.addAsyncListener('dir', () => {});
    await traverse.runAsync();
    const pathsStore = PathsStore.getInstance();
    pathsStore.eachPath(async ({ uri, preferredIntents, itemIntents }) => {
      await buildPage({
        distRootDir,
        uriPath: uri,
        preferredIntents,
        itemIntents,
        pathsStore,
      });
    });
  } catch (err) {
    log.error(err);
  }
}

main();
