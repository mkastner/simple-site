const log = require('mk-log');


module.exports = function streamPromise(stream) {
  
  return new Promise((resolve, reject) => {
    
    try {
      stream.on('finish', () => {
        log.debug('on finish', ); 
        resolve(); 
      });
      stream.on('end', () => {
        log.debug('on end'); 
        //resolve();
      });
      stream.on('error', reject);
      stream.end();
    } catch (error) {
      log.error(error);
      return reject(error); 
    }
  });
}

