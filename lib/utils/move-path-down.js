const path = require('path');

module.exports = function movePathDown(fullPath, level = 0, clos) {
  const splittedPath = fullPath.split(path.sep);
  if (level >= splittedPath.length) return;

  const slicedPath = splittedPath.slice(0, level + 1);

  let levelPath = slicedPath.join('/');
  // add starting slash for empty path
  if (levelPath === '') levelPath = '/';


  clos(levelPath);

  movePathDown(fullPath, level + 1, clos);
};
