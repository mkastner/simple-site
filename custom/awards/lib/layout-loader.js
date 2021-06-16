const fetch = require('node-fetch');
const url = 'https://www.fmh.de/api/templates/2303';
const fs = require('fs').promises;
const log = require('mk-log');
const path = require('path');
const siteName = process.env.SIMPLESITE_NAME;
const srcRootDir = path.resolve(path.join('custom', siteName, 'src'));

async function main() {
 
  try {

    const res = await fetch(url);
    const body = await res.text();


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
    
    await fs.writeFile(path.join(srcRootDir, 'index-layout.handlebars'), layout);
  } catch (err) {
    log.error(err);
  }
}

main();
