const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3010;
const Path = require('path');
const http = require('http');
const log = require('mk-log');
const buildAsset = require('./lib/utils/build-asset.js');
const handlebarsHelpers = require('./lib/utils/handlebars/helpers.js');
const populatePathsStore = require('./lib/utils/populate-paths-store.js');
const requireModule = require('./lib/utils/require-module.js');
const mergeCustomConfigEnv = require('./lib/utils/merge-custom-config-env.js');
const BuildPage = require('./lib/build/page.js');
const PathsStore = require('./lib/utils/paths-store.js');
const traverseDirectory = require('./lib/utils/traverse-directory.js');
const globIntentPatterns = require('./lib/utils/glob-intent-patterns.js');
const DirLocations = require('./lib/utils/dir-locations.js');
const PartialPaths = require('./lib/utils/partial-paths.js');

const loadedCustomConfig = requireModule(
  Path.join(DirLocations.src.absolute, 'index.config.json')
);
const customConfig = mergeCustomConfigEnv(loadedCustomConfig);

log.info('NODE_ENV', process.env.NODE_ENV);

const expressConfig = {
  layoutsDir: DirLocations.src.absolute,
  defaultLayout: 'index-layout',
  helpers: handlebarsHelpers,
};

app.set('view engine', 'hbs');
app.engine('hbs', exphbs(expressConfig));

app.set('views', DirLocations.src.absolute);

/*
app.use(
  '/sitemap.xml',
  express.static(__dirname + `/custom/${siteName}/dist/sitemap.xml`)
);
*/

// route all assets to dist location
const assetFilter =
  /\.(png|svg|js|js\.map|jpeg|jpg|json|css|css\.map|dist|xml|woff)$/;
app.get(assetFilter, express.static(DirLocations.dist.absolute));

app.use('/dev/', express.static(__dirname + '/public/dev/'));

app.use('/favicon.ico', (_req, res) => {
  res.status(200).end();
});

app.use('/robots.txt', (_req, res) => {
  res.status(200).end();
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

if (customConfig.routes && customConfig.routes.length) {
  for (let i = 0, l = customConfig.routes.length; i < l; i++) {
    const url = customConfig.routes[i].url;
    const router = require(customConfig.routes[i].app);

    app.use(url, router);
  }
}

async function main() {
  const traverse = traverseDirectory(DirLocations.src.absolute);
  traverse.fileGlobPatterns = globIntentPatterns;
  traverse.event.addAsyncListener('file', populatePathsStore);
  traverse.event.addAsyncListener('dir', () => {});
  await traverse.runAsync();
  const pathsStore = PathsStore.getInstance();
  const partialPaths = await PartialPaths(DirLocations.src.absolute);

  app.get('/*', async (req, res) => {
    try {
      //if (req.path.match(/.*?\.(svg|woff|js)$/)) {
      if (req.path.match(/\.(svg|woff|js)$/)) {
        log.info('path:', req.path);
        log.error('Check if resource exists in dist folder:', req.path);
        throw new Error('path with this extension should not get this far');
      }

      const preferredIntents = pathsStore.pull(req.path);
      const buildPage = await BuildPage({
        uriPath: req.path,
        preferredIntents,
        itemIntents: pathsStore.paths.get(req.path),
        pathsStore,
        partials: partialPaths.partials
      });

      const page = buildPage.toString();

      res.status(200).send(page);
    } catch (err) {
      log.error(err);
      res.status(500).send(`An error has occured: ${err}`);
    }
  });

  const server = http.createServer(app);

  server.listen(port, () => {
    if (process.env.NODE_ENV === 'development') {
      const srcRoot = DirLocations.src.basename;
      const watchedPaths = [`${srcRoot}/**/*.{hbs,handlebars,md,json,js,scss}`];
      const chokidar = require('chokidar');
      const watcher = chokidar.watch(watchedPaths);
      const WebSocket = require('ws');
      const wss = new WebSocket.Server({ server });
      wss.on('connection', (ws) => {
        log.info('wss connection established');
        ws.send('server connected');
        ws.on('message', (msg) => {
          log.info('wss message received:', msg);
        });
        watcher.on('change', (changedPath) => {
          log.info('path changed:', changedPath);
          const changedCustomPath = changedPath.replace(srcRoot, '');
          let changedUri = '';
          if (changedPath.indexOf('.scss') !== -1) {
            log.info('changedPath', changedPath);
            log.info('changedCustomPath', changedCustomPath);
            try {
              changedUri = buildAsset(changedCustomPath).writeCss();
            } catch (err) {
              log.error(err);
            }
            //const result = buildCss(changedPath);
            //log.info('result', result);
          }
          log.info('changedUri', changedUri);
          ws.send(JSON.stringify({ path: changedUri }));
        });
      });
    }
    log.info(`Example app listening at port:${port}`);
  });
}

main();
