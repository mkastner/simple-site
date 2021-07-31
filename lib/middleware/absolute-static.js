const fs = require('fs');

module.exports = function absoluteStatic(absolutePath) {
  return (req, res, next) => {
    const readStream = fs.createReadStream(absolutePath);
    readStream.on('open', () => {
      readStream.pipe(res);
    });
    readStream.on('error', (err) => {
      res.status(400).end(err);
    });
    next();
  };
};
