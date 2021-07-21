const siteName = process.env.SIMPLESITE_NAME;
const Path = require('path-extra');
const log = require('mk-log');
const fs = require('fs-extra');
const sass = require('node-sass');
const UglifyJs = require('uglify-js');
const fileStem = require('./file-stem.js');
const sourceRoot = Path.resolve(__dirname, '../../', `custom/${siteName}/src/`);
const distRoot = Path.resolve(__dirname, '../../', `custom/${siteName}/dist/`);
const requireModule = require('./require-module.js');
const loadedCustomConfig = requireModule(
  `./custom/${siteName}/src/index-config.json`
);
const mergeCustomConfigEnv = require('./merge-custom-config-env.js');
const customConfig = mergeCustomConfigEnv(loadedCustomConfig);

module.exports = function buildAsset(urlOrPath) {
  const stem = fileStem(urlOrPath);
  const nameWithExt = Path.basename(urlOrPath);
  const uriDirPath = Path.dirname(urlOrPath);
  const sourceDir = Path.join(sourceRoot, uriDirPath);
  const distTargetDir = Path.join(distRoot, uriDirPath);

  log.debug('distRoot', distRoot);
  log.debug('distTargetDir', distTargetDir);

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
      const result = UglifyJs.minify(
        { [publicPath]: jsCode.toString() },
        {
          sourceMap: {
            filename: `${stem}.js`,
            root: customConfig.host,
            url: `${publicPath}.map`,
          },
        }
      );
      fs.writeFileSync(Path.join(distTargetDir, `${stem}.js`), result.code);
      fs.writeFileSync(Path.join(distTargetDir, `${stem}.js.map`), result.map);
      return publicPath;
    },
    writeSvg() {
      const publicPath = Path.join(uriDirPath, `${stem}.svg`);
      log.info('distTargetDir', distTargetDir);
      fs.ensureDirSync(distTargetDir);
      log.info('sourceDir', sourceDir);
      const svgCode = fs.readFileSync(Path.join(sourceDir, `${stem}.svg`));
      fs.writeFileSync(Path.join(distTargetDir, `${stem}.svg`), svgCode);
      return publicPath;
    },
    writeWoff() {
      const publicPath = Path.join(uriDirPath, `${stem}.woff`);
      log.info('distTargetDir', distTargetDir);
      fs.ensureDirSync(distTargetDir);
      log.info('sourceDir', sourceDir);
      const woffCode = fs.readFileSync(Path.join(sourceDir, `${stem}.woff`));
      fs.writeFileSync(Path.join(distTargetDir, `${stem}.woff`), woffCode);
      return publicPath;
    },
    justCopy() {
      log.info('uriDirPath:', uriDirPath);
      const publicPath = Path.join(uriDirPath, nameWithExt);
      log.info('distTargetDir', distTargetDir);
      fs.ensureDirSync(distTargetDir);
      log.info('sourceDir', sourceDir);
      const sourcePath = Path.join(sourceDir, nameWithExt);
      const targetPath = Path.join(distTargetDir, nameWithExt);
      fs.copySync(sourcePath, targetPath);
      return publicPath;
    },
  };
};
