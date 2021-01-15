const express = require('express');
const exphbs = require('express-handlebars'); 
const fs = require('fs-extra');
const bodyParser = require('body-parser');
const contactMailer = require('./lib/mailer/contact');
const { validationResult } = require('express-validator');
const contactFormValidation = require('./lib/utils/contact-form-validation');
const path = require('path');
const app = express()
const port = 3000
const http = require('http');
const log = require('mk-log');
const siteName = process.env.SIMPLESITE_NAME; 
const buildCss = require('./lib/utils/build-css');
const buildPathContent = require('./lib/utils/build-path-content');
const handlebarsHelpers = require('./lib/utils/handlebars/helpers');

if (!siteName) {
  throw new Error('SIMPLESITE_NAME missing in env'); 
}

log.info('siteName', siteName);

const menu = JSON.parse(
  fs.readFileSync(path.join(__dirname, `custom/${siteName}/src/index-menu.json`), 'utf8'));

const expressConfig = {
  layoutsDir: path.join(__dirname, `/custom/${siteName}/src`),
  defaultLayout: 'index-layout',
  helpers: handlebarsHelpers
};

app.set('view engine', 'hbs');
app.engine('hbs', exphbs(expressConfig));

const viewsDir = __dirname + `/custom/${siteName}/src`;

app.set('views', viewsDir);

app.use('/sitemap.xml', express.static(__dirname + `/custom/${siteName}/sitemap.xml`));
app.use('/assets/', express.static(__dirname + `/custom/${siteName}/assets/`));
app.use('/css/', express.static(__dirname + `/custom/${siteName}/dist/css/`));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

const absViewsDir = path.resolve(viewsDir);  

app.get('/kontakt', (req, res) => {
  res.render('forms/contact', {menu});
});


app.post('/kontakt', contactFormValidation, async (req, res) => {
  try {
    log.info('req.body', req.body);
    const { errors } = validationResult(req);
    log.info('validation errors', errors);
    if (errors.length) {
      return res.render('forms/contact', { form: req.body, menu, reqPath: req.path, errors });
    }

    const result = await contactMailer.sendContact(req.body); 
    res.render('forms/success', { form: req.data, menu, reqPath: req.path, result} );
  } catch (err) {
    res.status(500).send(err); 
  }
});

app.get('/*', async (req, res) => {
  try {

    const {  page, status } = 
      await buildPathContent(absViewsDir, req.path); 

    res.status(status).send(page);
  } catch (err) {
    log.error(err);
    res.status(500).send(`An error has occured: ${err}`);
  }
})

const server = http.createServer(app);

server.listen(port, () => {
  if (process.env.NODE_ENV === 'development') {
    const sass = require('node-sass'); 
    const chokidar = require('chokidar');
    const watcher = chokidar.watch([`custom/${siteName}/**/*.{hbs,handlebars,md,json,scss}`]);
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({server});
    wss.on('connection', (ws) => {
      log.info('wss connection established');
      ws.send('server connected');
      ws.on('message', (msg) => {
        log.info('wss message received:', msg); 
      });
      watcher.on('change', (changedPath) => {
        log.info('path changed:', changedPath);
        let publicPath = changedPath;
        if (changedPath.indexOf('.scss') !== -1) {
          const result = buildCss(changedPath); 
          log.info('result', result);
        } 
        log.info('publicPath', publicPath);
        ws.send(JSON.stringify({path: publicPath})); 
      });
    });
  } 

  console.log(`Example app listening at port:${port}`)
});
