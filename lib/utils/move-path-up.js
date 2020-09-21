const path = require('path');

module.exports = function movePathUp(p, clos) {

  clos(p);

  if (!p || (p === '/')) return; 

  movePathUp(path.dirname(p), clos);

};
