const getVal = require('./get-const-val.js');

const Const = {
  RedirectType300: 0,
  RedirectType301: 1,
  RedirectType302: 2,
  RedirectType303: 3,
  RedirectType304: 4,
  RedirectType305: 5,
  RedirectType306: 6,
  RedirectType307: 7,
  RedirectType308: 8
};

Const.RedirectTypes = [

  { label: 'Multiple Choices', code:    300, redirectType: Const.RedirectType300 },
  { label: 'Moved Permanently', code:   301, redirectType: Const.RedirectType301 },
  { label: 'Found', code:               302, redirectType: Const.RedirectType302 },
  { label: 'See Other', code:           303, redirectType: Const.RedirectType303 },
  { label: 'Not Modified', code:        304, redirectType: Const.RedirectType304 },
  { label: 'Use Proxy', code:           305, redirectType: Const.RedirectType305 },
  { label: 'reserved', code:            306, redirectType: Const.RedirectType306 },
  { label: 'Temporary Redirect', code:  307, redirectType: Const.RedirectType307 },
  { label: 'Permanent Redirect', code:  308, redirectType: Const.RedirectType308 }

];

Const.getVal = getVal; 

module.exports = Const;
