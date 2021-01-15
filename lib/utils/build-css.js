const siteName = process.env.SIMPLESITE_NAME;
const path = require('path-extra');
const fs = require('fs-extra');
const sass = require('node-sass'); 
const targetDir = path.join(`custom/${siteName}/dist/css/`);
const sourceRoot = path.join(`custom/${siteName}/src/`);

module.exports = function buildCss(urlOrPath) {
  // can be either css url or scss file path
  const baseName = path.base(urlOrPath);
  const publicPath = `/css/${baseName}.css`;
  fs.ensureDirSync(targetDir);
  const result = sass.renderSync({
    file: path.join(sourceRoot, `${baseName}.scss`),
    sourceMap: true,
    outFile: `${baseName}.css` 
  });
  fs.writeFileSync(path.join(targetDir, `${baseName}.css`), result.css);
  fs.writeFileSync(path.join(targetDir, `${baseName}.css.map`), result.map);

  return publicPath; 

}
