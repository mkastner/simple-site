const tape = require('tape');
const log = require('mk-log');
const path = require('path');
const buildPathContent = require('../../../lib/utils/build-path-content.js');

async function main() {
  const viewsDir = path.resolve(
    path.join(__dirname, '../../../', 'views/test')
  );
  log.info('viewsDir', viewsDir);
  tape('build root content', async (t) => {
    try {
      const { templatePath, htmlText, meta, status } = await buildPathContent(
        viewsDir,
        '/'
      );

      log.info('templatePath', templatePath);
      log.info('htmlText', htmlText);
      log.info('meta    ', meta);
      log.info('status  ', status);

      t.match(htmlText, /<h1>Headline Root<\/h1>/);
    } catch (err) {
      log.error(err);
    } finally {
      t.end();
    }
  });

  tape('build subdir content', async (t) => {
    try {
      const { templatePath, htmlText, meta, status } = await buildPathContent(
        viewsDir,
        '/subdir'
      );
      log.info('templatePath', templatePath);
      log.info('htmlText', htmlText);
      log.info('meta    ', meta);
      log.info('status  ', status);

      t.match(htmlText, /<h1>Headline Subdir<\/h1>/);
    } catch (err) {
      log.error(err);
    } finally {
      t.end();
    }
  });
}

main();
