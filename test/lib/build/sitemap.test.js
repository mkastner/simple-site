const tape = require('tape');
const log = require('mk-log');
const SitemapBuilder = require('../../../lib/build/sitemap.js');
const DirLocations = require('../../../lib/utils/dir-locations.js');
const env = process.env.NODE_ENV || 'development';
const config = require(`../../../config/env/${env}-config.js`);

log.info('!!!DirLocations.dist.absolute', DirLocations.dist.absolute);

/*
const templateUrls = options.templateUrls.reduce((mapObj, listItem) => {
  if (listItem.template) {
    mapObj[listItem.template] = listItem.url;
  }
  return mapObj;
}, {});
*/

async function main() {
  tape('build sitemap with Sitemap Builder', async (t) => {
    try {
      log.info('DirLocations.dist.absolute', DirLocations.dist.absolute);

      const sitemapBuilder = await SitemapBuilder({
        hostName: config.baseUri,
        rootDir: DirLocations.dist.absolute,
        targetDir: DirLocations.dist.absolute,
      });

      //log.info('DirLocations', DirLocations.dist.absolute);
      //log.info('sitemapBuilder', sitemapBuilder);

      await sitemapBuilder.build();
    } catch (err) {
      log.error(err);
    } finally {
      t.end();
    }
  });
}

main();
