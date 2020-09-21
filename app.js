const express = require('express')
const fs = require('fs');
const exphbs = require('express-handlebars');
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
const buildPathContent = require('./lib/utils/build-path-content');
const handlebarsHelpers = require('./lib/utils/handlebars-helpers');

if (!siteName) {
  throw new Error('SIMPLESITE_NAME missing in env'); 
}

log.info('siteName', siteName);

const menuItems = JSON.parse(
  fs.readFileSync(path.join(__dirname, `views/${siteName}/menu.json`), 'utf8'));
const expressConfig = {
  layoutsDir: __dirname + `/views/${siteName}/layouts`,
  helpers: handlebarsHelpers
};

app.set('view engine', 'hbs');
app.engine('hbs', exphbs(expressConfig));

const viewsDir = __dirname + `/views/${siteName}`;

app.set('views', viewsDir);

app.use('/sitemap.xml', express.static(__dirname + `/views/${siteName}/sitemap.xml`));
app.use('/assets/', express.static(__dirname + `/views/${siteName}/assets/`));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

const absViewsDir = path.resolve(viewsDir);  

app.get('/kontakt', (req, res) => {
  res.render('forms/contact', {menuItems});
});


app.post('/kontakt', contactFormValidation, async (req, res) => {
  try {
    log.info('req.body', req.body);
    const { errors } = validationResult(req);
    log.info('validation errors', errors);
    if (errors.length) {
      return res.render('forms/contact', { form: req.body, menuItems, reqPath: req.path, errors });
    }

    const result = await contactMailer.sendContact(req.body); 
    res.render('forms/success', { form: req.data, menuItems, reqPath: req.path, result} );
  } catch (err) {
    res.status(500).send(err); 
  }
});

app.get('/*', async (req, res) => {
  try {

    const { templatePath, htmlText, meta, status } = 
      await buildPathContent(absViewsDir, req.path); 
    log.info('templatePath', templatePath);
    log.info('htmlText', htmlText);

    res.status(status);
    res.render(templatePath, {item: 'test', meta, htmlText, menuItems, reqPath: req.path});
  } catch (err) {
    log.error(err);
    res.status(500).send(`An error has occured: ${err}`);
  }
})

const server = http.createServer(app);

server.listen(port, () => {
  if (process.env.NODE_ENV === 'development') {
    const chokidar = require('chokidar');
    const watcher = chokidar.watch([`views/${siteName}/**/*.{hbs,handlebars,md,json}`, 'public/**/*.css']);
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
        if (changedPath.indexOf('.css') !== -1) {
          publicPath = `/css/${siteName}/${path.basename(changedPath)}`;
        } 
        ws.send(JSON.stringify({path: publicPath})); 
      });
    });
  } 

  console.log(`Example app listening at port:${port}`)
});
