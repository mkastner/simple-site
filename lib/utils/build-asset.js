const Path = require('path-extra');
const log = require('mk-log');
const fs = require('fs-extra');
const sass = require('node-sass');
const UglifyJs = require('uglify-js');
const fileStem = require('./file-stem.js');
const sourceRoot = Path.resolve('src/');
const distRoot = Path.resolve('dist/');
const env = process.env.NODE_ENV || 'development';
const config = require(Path.resolve(`config/env/${env}-config.js`));
// using Handlebars as fronten js preprocessor
const Handlebars = require('handlebars');

module.exports = function buildAsset(urlOrPath) {
  const stem = fileStem(urlOrPath);
  const nameWithExt = Path.basename(urlOrPath);
  const uriDirPath = Path.dirname(urlOrPath);
  const sourceDir = Path.join(sourceRoot, uriDirPath);
  const distTargetDir = Path.join(distRoot, uriDirPath);

  return {
    writeCss() {
      const publicPath = Path.join(uriDirPath, `${stem}.css`);
      fs.ensureDirSync(distTargetDir);
      const result = sass.renderSync({
        file: Path.join(sourceDir, `${stem}.scss`),
        sourceMap: true,
        outFile: publicPath,
      });

      fs.writeFileSync(Path.join(distTargetDir, `${stem}.css`), result.css);
      fs.writeFileSync(Path.join(distTargetDir, `${stem}.css.map`), result.map);

      return publicPath;
    },
    writeJs() {
      const publicPath = Path.join(uriDirPath, `${stem}.js`);
      fs.ensureDirSync(distTargetDir);
      const jsCode = fs.readFileSync(Path.join(sourceDir, `${stem}.js`));
      const preprocessedJsCode = Handlebars.compile(jsCode.toString())({
        assetUri: config.assetUri,
      });

      let sourceMapUrl = '';
      if (config.assetUri) {
        sourceMapUrl += config.assetUri;
      }
      sourceMapUrl += Path.join(uriDirPath, `${publicPath}.map`);

      if (process.env.NODE_ENV === 'production') {
        const result = UglifyJs.minify(
          { [publicPath]: preprocessedJsCode },
          {
            sourceMap: {
              filename: `${stem}.js`,
              root: config.assetUri,
              url: sourceMapUrl,
            },
          }
        );
        fs.writeFileSync(Path.join(distTargetDir, `${stem}.js`), result.code);
        fs.writeFileSync(
          Path.join(distTargetDir, `${stem}.js.map`),
          result.map
        );
      } else {
        fs.writeFileSync(
          Path.join(distTargetDir, `${stem}.js`),
          preprocessedJsCode
        );
      }
      return publicPath;
    },
    writeSvg() {
      const publicPath = Path.join(uriDirPath, `${stem}.svg`);
      fs.ensureDirSync(distTargetDir);
      const svgCode = fs.readFileSync(Path.join(sourceDir, `${stem}.svg`));
      fs.writeFileSync(Path.join(distTargetDir, `${stem}.svg`), svgCode);
      return publicPath;
    },
    writeWoff() {
      const publicPath = Path.join(uriDirPath, `${stem}.woff`);
      fs.ensureDirSync(distTargetDir);
      const woffCode = fs.readFileSync(Path.join(sourceDir, `${stem}.woff`));
      fs.writeFileSync(Path.join(distTargetDir, `${stem}.woff`), woffCode);
      return publicPath;
    },
    justCopy() {
      const publicPath = Path.join(uriDirPath, nameWithExt);
      fs.ensureDirSync(distTargetDir);
      const sourcePath = Path.join(sourceDir, nameWithExt);
      const targetPath = Path.join(distTargetDir, nameWithExt);
      fs.copySync(sourcePath, targetPath);
      return publicPath;
    },
  };
};
