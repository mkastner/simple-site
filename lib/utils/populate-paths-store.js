const log = require('mk-log');
const PathsStore = require('../utils/paths-store.js');

// This is an event handler/listener for
// populatePathsStore file event
module.exports = async function populatePathsStore({ file, initialDirectory }) {
  try {
    const pathsStore = PathsStore.getInstance();
    await pathsStore.putAsync({
      localSrcPath: initialDirectory,
      localFilePath: file,
    });
  } catch (err) {
    log.error(err);
  }
};
