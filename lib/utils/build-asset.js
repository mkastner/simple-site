const Path = require('path-extra');
//const log = require('mk-log');
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
const fileExistsAtPath = require('./file-exists-at-path.js');

// builds (e.g. sass to css) and then
// moves the file to target dir
// if it doesn't already exist in target
// it does NOT hash or compress the file name
// file name hashing and compressing
// happens in => lib/utils/write-dist-assets.js

module.exports = function buildAsset(urlOrPath) {
  const stem = fileStem(urlOrPath);
  const nameWithExt = Path.basename(urlOrPath);
  const uriDirPath = Path.dirname(urlOrPath);
  const sourceDir = Path.join(sourceRoot, uriDirPath);
  const distTargetDir = Path.join(distRoot, uriDirPath);

  return {
    writeCss() {
      // don't process if targetPath i.e. targetFile aready
      // exitst
      const targetPath = Path.join(distTargetDir, `${stem}.css`);
      const publicPath = Path.join(uriDirPath, `${stem}.css`);
      if (fileExistsAtPath(targetPath)) return publicPath;

      fs.ensureDirSync(distTargetDir);
      const result = sass.renderSync({
        file: Path.join(sourceDir, `${stem}.scss`),
        sourceMap: true,
        outFile: publicPath,
      });

      fs.writeFileSync(targetPath, result.css);
      fs.writeFileSync(`${targetPath}.map`, result.map);

      return publicPath;
    },
    writeJs() {
      const publicPath = Path.join(uriDirPath, `${stem}.js`);

      const targetPath = Path.join(distTargetDir, `${stem}.js`);
      if (fileExistsAtPath(targetPath)) return publicPath;

      fs.ensureDirSync(distTargetDir);
      const jsCode = fs.readFileSync(Path.join(sourceDir, `${stem}.js`));
      const preprocessedJsCode = Handlebars.compile(jsCode.toString())({
        assetUri: config.assetUri,
      });

      if (process.env.NODE_ENV === 'production') {
        let sourceMapUrl = '';
        if (config.assetUri) {
          sourceMapUrl += config.assetUri;
        }
        sourceMapUrl += Path.join(uriDirPath, `${publicPath}.map`);
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
      const targetPath = Path.join(distTargetDir, nameWithExt);
      const publicPath = Path.join(uriDirPath, `${stem}.svg`);
      // prevent file write race conditions
      if (fileExistsAtPath(targetPath)) return publicPath;
      fs.ensureDirSync(distTargetDir);
      const sourcePath = Path.join(sourceDir, nameWithExt);
      fs.copySync(sourcePath, targetPath);
      return publicPath;
    },
    writeWoff() {
      const targetPath = Path.join(distTargetDir, nameWithExt);
      const publicPath = Path.join(uriDirPath, `${stem}.woff`);
      // prevent file write race conditions
      if (fileExistsAtPath(targetPath)) return publicPath;
      fs.ensureDirSync(distTargetDir);
      const sourcePath = Path.join(sourceDir, nameWithExt);
      fs.copySync(sourcePath, targetPath);
      return publicPath;
    },
    justCopy() {
      const targetPath = Path.join(distTargetDir, nameWithExt);
      // prevent file write race conditions
      if (fileExistsAtPath(targetPath)) return publicPath;
      const publicPath = Path.join(uriDirPath, nameWithExt);
      fs.ensureDirSync(distTargetDir);
      const sourcePath = Path.join(sourceDir, nameWithExt);
      fs.copySync(sourcePath, targetPath);
      return publicPath;
    },
  };
};
