const Path = require('path-extra');
const env = process.env.NODE_ENV || 'development';
const log = require('mk-log');

const config = require(Path.resolve(`config/env/${env}-config.js`));
const srcDir = Path.resolve(config.srcDir);
const distDir = Path.resolve(config.distDir);

const src = srcDir || 'site';
const dist = distDir || 'dist';

const DirLocations = {
  src: {
    basename: Path.basename(src),
    absolute: Path.resolve(src),
  },
  dist: {
    basename: Path.basename(dist),
    absolute: Path.resolve(dist),
  },
};

Object.freeze(DirLocations);

log.info('DirLocations *******************************************');
log.info('DirLocations src.basename :', DirLocations.src.basename);
log.info('DirLocations dist.basename:', DirLocations.dist.basename);
log.info('DirLocations src.absolute :', DirLocations.src.absolute);
log.info('DirLocations dist.absolute:', DirLocations.dist.absolute);
log.info('DirLocations *******************************************');

module.exports = DirLocations;
