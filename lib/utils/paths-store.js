const log = require('mk-log');
const fs = require('fs').promises;
const Path = require('path');
const Handlebars = require('handlebars');
// const handlebarsGlobalHelpers = require('./handlebars/helpers.js');
const movePathDown = require('./move-path-down.js');
const matchIntentFile = require('./match-intent-file.js');

// const { merge } = require('webpack-merge');

module.exports = {
  instance: null,

  getInstance() {
    if (this.instance) {
      //log.info('instance', this.instance);
      return this.instance;
    }
    this.instance = Object.create(
      {
        // use request path as key
        async putAsync({ localSrcPath, localFilePath }) {
          // localSrcPath e.g.: src
          // localFilePath e.g.:
          // src/index.text.md
          // src/some/thing.loader.js
          // uri e.g.:
          // /index
          // /some/thing
          // /some/index
          try {
            const matchedIntentFile = matchIntentFile(localFilePath);
            const name = matchedIntentFile.name();
            const intent = matchedIntentFile.intent();
            const fileUri = localFilePath.replace(localSrcPath, '');
            const dirName = Path.dirname(fileUri);
            const storeItemPath = Path.join(dirName, name);

            /*
             * maybe you need this
            let pathItemIntent = pathItem.get(intent);
            if (pathItemIntent) {
              return pathItemIntent;
            }
            */
            let result;
            if (intent === 'loader') {
              const requiredItem = require(localFilePath);
              const loader = await requiredItem.load();

              if (loader.eachVariant) {
                loader.eachVariant(
                  ({ loaderData, pathSection, _fullData, _length }) => {
                    if (pathSection) {
                      const itemStoreUri = Path.join(dirName, `${pathSection}`);
                      let loaderVariantItem = this.paths.get(itemStoreUri);
                      if (!loaderVariantItem) {
                        loaderVariantItem = new Map();
                      }
                      loaderVariantItem.set('loaderData', loaderData);
                      loaderVariantItem.set('loaderRef', storeItemPath);
                      this.paths.set(itemStoreUri, loaderVariantItem);
                    }
                  }
                );
              }
              result = loader;
            } else if (
              intent === 'hbshelpers' &&
              localFilePath.match(/\.js$/)
            ) {
              const handlebarsHelpers = require(localFilePath);
              result = handlebarsHelpers;
            } else if (localFilePath.match(/\.js(on)*$/)) {
              result = require(localFilePath);
            } else if (localFilePath.match(/\.md$/)) {
              result = await fs.readFile(localFilePath, 'utf8');
            } else if (localFilePath.match(/\.h(andlebars|bs)$/)) {
              const fileContent = await fs.readFile(localFilePath, 'utf8');
              const compiledHandlebars = Handlebars.compile(fileContent);
              result = compiledHandlebars;
            }

            let pathItem = this.paths.get(storeItemPath);
            if (!pathItem) {
              pathItem = new Map();
            }

            if (intent === 'loader') {
              pathItem.set('loaderData', result);
            }
            pathItem.set(intent, result);

            this.paths.set(storeItemPath, pathItem);
          } catch (err) {
            log.error(err);
          }
        },
        // storePath explicitly uses index
        // as name
        pull(storePath) {
          const preferredIntents = new Map();
          movePathDown(storePath, 0, async (downPath) => {
            //log.info('downPath', downPath);
            let downPathItem = this.paths.get(downPath);

            if (!downPathItem) {
              //log.info('downPathItem', downPathItem);
              const indexDownPath = Path.join(downPath, 'index');
              //log.info('indexDownPath', indexDownPath);
              downPathItem = this.paths.get(indexDownPath);
            }

            if (downPathItem) {
              const loaderPathRef = downPathItem.get('loaderRef');

              //log.info('loaderPathRef', loaderPathRef);

              if (loaderPathRef) {
                const loaderPathItem = this.paths.get(loaderPathRef);

                if (loaderPathItem) {
                  // merging two maps
                  // downPathItem hasPrecedence
                  downPathItem = new Map([...loaderPathItem, ...downPathItem]);
                }
              }

              downPathItem.forEach((intentVal, intent) => {
                //log.info('intentVal', intentVal);
                // copy intents from loader to
                // variants
                // do not propagate loaders
                if (intent !== 'loader') {
                  preferredIntents.set(intent, intentVal);
                }
              });
            }
          });

          return preferredIntents;
        },
        // use eachPath for building the entire site
        eachPath(clos) {
          for (let [uri, val] of this.paths) {
            //log.info('uri', uri);
            const preferredIntents = this.pull(uri);
            clos({ uri, preferredIntents, itemIntents: val });
          }
        },
      },
      {
        paths: {
          type: Map,
          enumerable: true,
          value: null,
          writable: true,
        },
      }
    );

    if (!this.instance.paths) {
      this.instance.paths = new Map();
    }

    return this.instance;
  },
};
