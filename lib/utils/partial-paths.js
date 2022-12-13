const FastGlob = require('fast-glob');
const Path = require('path');
const PartialPattern = '_*.hbs'; 
const log = require('mk-log');
const fs = require('fs-extra');

async function readPartial(templatePath) {
  try {
    log.debug('templatPath', templatePath);
    const resolvedPath = Path.resolve(templatePath);
    log.debug('resolvedPath', resolvedPath);

    const rawTemplate = await fs.readFile(resolvedPath, 'utf8'); 
    const fileName = Path.basename(templatePath);
    const fName = fileName.replace('.hbs', '');
    log.info(`partial "${fName}"" path: `, templatePath);
    return { name: fName, content: rawTemplate};        
  } catch (err) {
    log.error(err);
    return { name: fName, content: `Error in partial${templatePath}`}
  } 
}

module.exports = async function PartialPaths(rootDir) {
  let partials = {};
  try {
    const partialPatterns = Path.join(rootDir, '/**/' , PartialPattern);
    log.debug('partialPaterns', partialPatterns);
    const paths = await FastGlob(partialPatterns);
    
    log.debug('globbed  paths', paths);
    const mappedPartials = paths.map(p => readPartial(p));
    const readPartials = await Promise.all(mappedPartials);

    partials = readPartials.reduce((reducer, item) => {
      reducer[item.name] = item.content;
      return reducer;
    }, {});
    log.debug('partials', partials);
    return { partials };
  } catch (err) {
    log.error(err);
    return { partials };
  } 
};