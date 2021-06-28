const fetch = require('node-fetch');
const url = 'https://www.fmh.de/zinsen-vergleiche/robo-advisor-vergleich';
const fs = require('fs').promises;
const log = require('mk-log');
const path = require('path');
const siteName = process.env.SIMPLESITE_NAME;
const srcRootDir = path.resolve(path.join('custom', siteName, 'src'));
const { DOMParser, parseHTML } = require('linkedom');

async function main() {
  try {
    const res = await fetch(url);
    const fullTemplate = await res.text();

    const absURLsTemplate = fullTemplate
      .replace(/(src|href)="(\/)/gm, (_, p1, p2) => {
        return `${p1}="https://www.fmh.de/`;
      })
      .replace(/url\(\//gm, 'url(https://www.fmh.de/');

    const {
      window,
      document,
      customElements,
      HTMLElement,
      Event,
      CustomEvent,
    } = parseHTML(absURLsTemplate);

    const head = document.getElementsByTagName('head')[0];
    log.info('head', head);
    const linkEle = document.createElement('link');
    linkEle.rel = 'stylesheet';
    linkEle.type = 'text/css';
    linkEle.href = '/css/index.css';
    head.appendChild(linkEle);

    log.info('head', head);

    const main = document.getElementsByTagName('main')[0];

    main.innerHTML = '{{{body}}}';

    /*
    const headerJSCode = [];

    if (process.env.NODE_ENV === 'development') {
      headerJSCode.push(`
        <script src="/js/websocket.js"></script>
      `);
    } 

    const headerCSSCode = [];

    headerCSSCode.push(`
      <link href="/css/index.css" rel="stylesheet" />
    `);

    let layout = body.replace('[CONTENT]', '{{{body}}}')
      .replace('<!--[JAVASCRIPTS-HEAD]-->', headerJSCode.join('\n')) 
      .replace('<!--[STYLESHEETS-HEAD]-->', headerCSSCode.join('\n')); 
  
    if (process.env.NODE_ENV === 'development') {
      layout = layout.replace(`<div id="cookie-banner"><cookie-banner></cookie-banner></div>`, ''); 
    }
    */

    const htmlPage = document.toString();
    await fs.writeFile(
      path.join(srcRootDir, 'index-layout.handlebars'),
      htmlPage
    );
  } catch (err) {
    log.error(err);
  }
}

main();
