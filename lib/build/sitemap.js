const fs = require('fs-extra');
const Path = require('path');
const log = require('mk-log');
const FastGlob = require('fast-glob');
const writeCompressFile = require('../utils/write-compress-file.js');
const Handlebars = require('handlebars');
const TraverseDirectory = require('../utils/traverse-directory.js');
const micromatch = require('micromatch'); // dep of fast-glob
const GlobStaticPatterns = require('../utils/glob-static-patterns.js');
const glob = require('fast-glob');

const cwd = process.cwd();

log.info('sitemap cwd', cwd);

let sitemapUriHook = null;

const uriHookPath = Path.join(cwd, 'lib/hooks', 'sitemap-uri.js');

log.info('|_| uriHookPath', uriHookPath);

if (glob.sync(uriHookPath)?.[0]) {
  sitemapUriHook = require(uriHookPath);
}

async function buildLocationItem({ filePath, initialDirectory, options }) {
  const stat = await fs.stat(filePath);
  const lastmod = stat.mtime.toISOString().split('T')[0];
  const changefreq = 'daily';

  const uriPath = filePath
    .replace(initialDirectory, '')
    .replace(/(index)*\.html/, '');
  const pathLevel = uriPath.split('/').length - 2;
  const priority = 1 - pathLevel / 10;

  // hook for manipulating paths
  let loc = options.hook(uriPath);
  log.debug('hooked location', loc);

  const matchedLoc = loc.match(/^\//);

  if (matchedLoc && options.hostName) {
    // prepend host name if neccessary
    loc = loc.replace(/^\//, `${options.hostName}/`);
    // remove trailing slash
    loc = loc.replace(/\/$/, '');
  }

  return { loc, lastmod, changefreq, priority };
}

module.exports = async function Sitemap(newOptions = {}) {
  // glob always returns collection
  const defaultTemplatePath = Path.resolve(
    __dirname,
    '../utils/handlebars/sitemap.hbs'
  );

  log.info('defaultTemplatPath', defaultTemplatePath);

  const options = Object.assign(
    {},
    {
      hostName: '',
      rootDir: '',
      hook: sitemapUriHook || ((uriPath) => uriPath), // tap into uriPath
      fileName: 'sitemap.xml',
      templatePath: defaultTemplatePath,
    },
    newOptions
  );

  const obj = Object.create(
    {
      /**
       * @param Object { loc, lastmod, changefreq, priority }
       **/
      addUrl(urlObj) {
        this.urls.push(urlObj);
      },
      async build() {
        try {
          //log.info('Path.resolve __dirname', Path.resolve(__dirname));
          const xmlTemplateContent = await fs.readFile(xmlTemplatePath, 'utf8');
          //log.info('xmlTemplateContent', xmlTemplateContent);
          const xmlTemplate = Handlebars.compile(xmlTemplateContent);
          const xmlTargetPath = `${options.rootDir}/sitemap.xml`;

          const xmlContent = xmlTemplate({ urls: this.urls });
          log.info('xmlContent', xmlContent);
          await fs.outputFile(xmlTargetPath, xmlContent, 'utf8');
          await writeCompressFile(xmlTargetPath, xmlContent, 'gz');
          await writeCompressFile(xmlTargetPath, xmlContent, 'br');
        } catch (err) {
          log.error(err);
        }
      },
    },
    {
      urls: {
        value: [],
      },
    }
  );

  const xmlTemplatePath = options.templatePath;

  log.info('rootDir  ***      :', options.rootDir);
  log.info('xmlTemplatePath   :', xmlTemplatePath);

  //const traverseDirectory = TraverseDirectory(options.rootDir);

  // GlobStaticPatterns
  // negated patterns to prevent e.g.
  // google*.html or robots.txt
  // these are the ones also used for
  // plain copy

  const permittedPatterns = ['*.html'];

  log.info(
    '--------- Sitemap Globs ---------\n' +
      '--------- Permitted ---------\n' +
      permittedPatterns.join('\n') +
      '--------- Negative ---------\n' +
      GlobStaticPatterns.join('\n') +
      '\n----------------------------------'
  );

  const recursivePermittedPatterns = permittedPatterns.map((p) =>
    Path.join(options.rootDir, '**/', p)
  );

  const permittedFiles = await FastGlob(recursivePermittedPatterns, {
    onlyFiles: true,
  });

  log.info('permittedFiles', permittedFiles);

  const recursiveDenyPatterns = GlobStaticPatterns.map((p) =>
    Path.join('!*/**/', p)
  );

  log.info('recursiveDenyPatterns', recursiveDenyPatterns);

  const allowedFiles = micromatch(permittedFiles, recursiveDenyPatterns);

  log.info('allowedFiles', allowedFiles);

  allowedFiles.forEach(async (filePath) => {
    const locationItem = await buildLocationItem({
      filePath,
      initialDirectory: options.rootDir,
      options,
    });
    obj.addUrl(locationItem);
  });

  /*
  await traverseDirectory.event.addAsyncListener(
    'file',
    async ({ file, initialDirectory }) => {
      log.debug('file ', file);

      const stat = await fs.stat(file);
      const lastmod = stat.mtime.toISOString().split('T')[0];
      const changefreq = 'daily';

      const uriPath = file
        .replace(initialDirectory, '')
        .replace(/(index)*\.html/, '');
      const pathLevel = uriPath.split('/').length - 2;
      const priority = 1 - pathLevel / 10;

      // hook for manipulating paths
      let loc = options.hook(uriPath);
      log.debug('hooked location', loc);

      const matchedLoc = loc.match(/^\//);

      if (matchedLoc && options.hostName) {
        // prepend host name if neccessary
        loc = loc.replace(/^\//, `${options.hostName}/`);
        // remove trailing slash
        loc = loc.replace(/\/$/, '');
      }

      obj.addUrl({ loc, lastmod, changefreq, priority });
    }
  );
  */

  return obj;
};
