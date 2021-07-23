const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const Path = require('path');
const app = express();
const port = 3010;
const http = require('http');
const log = require('mk-log');
const buildAsset = require('./lib/utils/build-asset');
const buildPathContent = require('./lib/utils/build-path-content');
const handlebarsHelpers = require('./lib/utils/handlebars/helpers');
const requireModule = require('./lib/utils/require-module.js');
const loadedCustomConfig = requireModule('./src/index-config.json');
const mergeCustomConfigEnv = require('./lib/utils/merge-custom-config-env.js');
const absoluteStatic = require('./lib/middleware/absolute-static-middleware.js');
const customConfig = mergeCustomConfigEnv(loadedCustomConfig);

log.info('NODE_ENV', process.env.NODE_ENV);

const srcDir = Path.resolve('src');
const distDir = Path.resolve('dist');

log.info('srcDir', srcDir);

const expressConfig = {
  layoutsDir: srcDir,
  defaultLayout: 'index-layout',
  helpers: handlebarsHelpers,
};

app.set('view engine', 'hbs');
app.engine('hbs', exphbs(expressConfig));

const viewsDir = srcDir;

app.set('views', viewsDir);

/*
app.use(
  '/sitemap.xml',
  express.static(__dirname + `/custom/${siteName}/dist/sitemap.xml`)
);
*/

// route all assets to dist location
const assetFilter = /\.(png|svg|js|jpeg|jpg|json|css|dist|xml|woff)$/;
//app.get(assetFilter, express.static(distDir));
app.get(assetFilter, absoluteStatic(distDir));

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

app.get('/*', async (req, res) => {
  try {
    //if (req.path.match(/.*?\.(svg|woff|js)$/)) {
    if (req.path.match(/\.(svg|woff|js)$/)) {
      log.info('path:', req.path);
      log.error('Check if resource exists in dist folder:', req.path);
      throw new Error('path with this extension should not get this far');
    }

    log.info('calling buildPathContent with req.path:', req.path);
    const buildPathContentResult = buildPathContent(srcDir, req.path);

    log.info('buildPathContentResult', buildPathContentResult);

    const pages = await buildPathContentResult.forDevelopment();

    res.status(pages[0].status).send(pages[0].page);
  } catch (err) {
    log.error(err);
    res.status(500).send(`An error has occured: ${err}`);
  }
});

const server = http.createServer(app);

server.listen(port, () => {
  if (process.env.NODE_ENV === 'development') {
    const srcRoot = 'src';
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