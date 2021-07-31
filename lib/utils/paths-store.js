const log = require('mk-log');
const fs = require('fs').promises;
const fsSync = require('fs');
const Path = require('path');
const FastGlob = require('fast-glob');
const Handlebars = require('handlebars');
const handlebarsGlobalHelpers = require('./handlebars/helpers.js');
const movePathDown = require('./move-path-down.js');
const globIntentPatterns = require('./glob-intent-patterns.js');
const globFilePaths = require('./glob-file-paths.js');

const { merge } = require('webpack-merge');

module.exports = {
  instance: null,

  getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = Object.create(
      {
        // use request path as key
        async putAsync(dirUri, absLocalDirPath) {
          try {
            // absLocalPath is a directorry
            const globLoaderPatterns = globFilePaths(
              absLocalDirPath,
              globIntentPatterns
            );
            // glob files in this dir

            const globbedPaths = FastGlob.sync(globLoaderPatterns);
            const promisesList = [];

            // log.info('absFilePath', globbedPaths);

            for (let i = 0, l = globbedPaths.length; i < l; i++) {
              const absFilePath = globbedPaths[i];
              promisesList.push(this.ensureIntentFile({ absFilePath, dirUri }));
            }
            const result = await Promise.all(promisesList);

            //log.info('result', result);

            return result;
          } catch (err) {
            log.error(err);
          }
        },
        pull(reqUri) {
          const preferredIntents = new Map();
          movePathDown(reqUri, 0, async (downPath) => {
            let pathItem = this.paths.get(downPath);
            if (!pathItem) {
              const indexPath = Path.join(downPath, 'index');
              // let consumer of pathItem know that
              // this is index
              pathItem = this.paths.get(indexPath);
              pathItem.set('index', true);
            }
            pathItem.forEach((intentVal, intent) => {
              preferredIntents.set(intent, intentVal);
            });
          });
          return preferredIntents;
        },

        async ensureIntentFile({ absFilePath, dirUri }) {
          // path e.g.:
          // /index.text.md
          // /some/thing.loader.js

          try {
            const regExp = /\/(\w+?)\.(\w+?)\.\w+?$/;
            const match = regExp.exec(absFilePath);
            const name = match[1];
            const intent = match[2];
            const storeItemPath = Path.join(dirUri, name);
            let pathItem = this.paths.get(storeItemPath);
            if (!pathItem) pathItem = new Map();
            let pathItemIntent = pathItem.get(intent);
            if (pathItemIntent) {
              return pathItemIntent;
            }

            let result;
            if (intent === 'loader' && absFilePath.match(/\.js$/)) {
              const requiredItem = require(absFilePath);
              result = requiredItem.load();
            } else if (intent === 'hbshelpers' && absFilePath.match(/\.js$/)) {
              const handlebarsHelpers = require(absFilePath);
              result = Promise.resolve(
                merge(handlebarsGlobalHelpers, handlebarsHelpers)
              );
            } else if (absFilePath.match(/\.js(on)*$/)) {
              result = Promise.resolve(require(absFilePath));
            } else if (absFilePath.match(/\.md$/)) {
              result = fs.readFile(absFilePath, 'utf8');
            } else if (absFilePath.match(/\.h(andlebars|bs)$/)) {
              const fileContent = fsSync.readFileSync(absFilePath, 'utf8');
              const compiledHandlebars = Handlebars.compile(fileContent);
              result = Promise.resolve(compiledHandlebars);
              await result;
            }

            pathItem.set(intent, result);
            this.paths.set(storeItemPath, pathItem);
          } catch (err) {
            log.error(err);
          }
        },
      },
      {
        paths: {
          type: Map,
          enumerable: true,
          value: new Map(),
        },
      }
    );
    return this.instance;
  },
};
