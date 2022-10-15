const FastGlob = require('fast-glob');
const Path = require('path');
const Event = require('./event.js');
const log = require('mk-log');
const DirLocations = require('./dir-locations.js');

module.exports = function traverseDirectory(
  //initialDirectory = Path.resolve('src')
  initialDirectory = DirLocations.src.absolute
) {
  log.info('initialDirectory :', initialDirectory);
  const obj = Object.create(
    {
      async runAsync() {
        try {
          await this.traverse(initialDirectory);
        } catch (err) {
          log.error(err);
        }
      },
      async traverse(directory) {
        try {
          this.event.fire('dir', { directory, initialDirectory });
          const joinedDirGlobPatterns = this.dirGlobPatterns.map((pattern) =>
            Path.join(directory, pattern)
          );
          const dirs = await FastGlob(joinedDirGlobPatterns, {
            onlyDirectories: true,
          });
          const joinedFileGlobPatterns = this.fileGlobPatterns.map((pattern) =>
            Path.join(directory, pattern)
          );
          const files = await FastGlob(joinedFileGlobPatterns, {
            onlyFiles: true,
          });

          const that = this;
          const filePromises = files.map((file) =>
            that.event.fireAsync('file', { file, initialDirectory })
          );
          await Promise.all(filePromises);
          await Promise.all(dirs.map((dir) => that.traverse(dir)));
        } catch (err) {
          log.error(err);
        }
      },
    },
    {
      event: {
        value: Event(),
      },
      dirGlobPatterns: {
        type: Array,
        value: ['/*'],
        writable: true,
      },
      fileGlobPatterns: {
        type: Array,
        value: ['/*'],
        writable: true,
      },
    }
  );

  return obj;
};
