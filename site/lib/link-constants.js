const getVal = require('./get-const-val.js');

const Const = {
  
  TargetTypeSelf: 0,
  TargetTypeBlank: 1,
  TargetTypeParent: 2,
  TargetTypeTop: 3,

  TextTypeAbstractPreview: 0,
  TextTypeDescription: 1,
  TextTypeAbstractFulltext: 2,
  TextTypeOther: 3 

};

Const.TargetTypes = [
  { '_self': Const.TargetTypeSelf },
  { '_blank': Const.TargetTypeBlank },
  { '_parent': Const.TargetTypeParent },
  { '_top': Const.TargetTypeTop }
];

Const.TextTypes = [
  { 'abstractPreview': Const.TextTypeAbstractPreview },
  { 'description': Const.TextTypeDescription },
  { 'fulltext': Const.TextTypeAbstractFulltext },
  { 'other': Const.TextTypeOther },
];

Const.getVal = getVal; 

module.exports = Const;
