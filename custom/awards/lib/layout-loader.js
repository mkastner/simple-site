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

    const layout = body.replace('[CONTENT]', '{{{body}}}'); 
    
    await fs.writeFile(path.join(srcRootDir, 'index-layout.handlebars'), layout);
  } catch (err) {
    log.error(err);
  }
}

main();
