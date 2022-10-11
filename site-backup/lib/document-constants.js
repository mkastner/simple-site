const getVal = require('./get-const-val.js');

const Const = {

  TextTypeAbstractPreview: 0,
  TextTypeDescription: 1,
  TextTypeAbstractFulltext: 2,
  TargetTypeOther: 3,

  AlignmentTypeJustify: 0,
  AlignmentTypeLeft: 1,
  AlignmentTypeRight: 2,
  AlignmentTypeCenter: 3

};

Const.TargetTypes = [

  { abstractPreview: Const.TextTypeAbstractPreview },
  { description: Const.TextTypeDescription },
  { abstractFulltext: Const.TextTypeAbstractFulltext },
  { other: Const.TextTypeOther },

];

Const.AlignmentTypes = [ 

  { justify: 0 },
  { left: 1 },
  { right: 2 },
  { center: 3 }

];

Const.getVal = getVal; 

module.exports = Const;
