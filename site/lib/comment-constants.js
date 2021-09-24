const getVal = require('./get-const-val');

const Const = {
  OriginTypeUser: 0,
  OriginTypePublisher: 1,
};

Const.OriginTypes = [
  { user: Const.OriginTypeUser },
  { publisher: Const.OriginTypePublisher },
];

Const.getVal = getVal;

module.exports = Const;
