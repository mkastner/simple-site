const Path = require('path');
//const log = require('mk-log');
const Max = 10;

module.exports = function movePathDown(reqPath, level = 0, clos) {
  // split path and remove blank entries caused by trailing or root slash

  const splittedPath = reqPath.split(Path.sep).filter((item) => item);
  if (reqPath.match(/^\//)) splittedPath.unshift('');
  // return when end of path has been reached

  if (level >= splittedPath.length) return splittedPath.length;
  // now increase path size by one section
  const nextLevel = level + 1;
  const slicedPath = splittedPath.slice('', nextLevel);

  let levelPath = slicedPath.join('/');
  // add starting slash for empty path
  if (levelPath === '') levelPath = '/';

  clos(levelPath);

  if (level >= Max) {
    throw new Error(`Runaway recursion movePathdown max ${Max} reached.`);
  }

  movePathDown(reqPath, nextLevel, clos);
};
