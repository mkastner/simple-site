const getVal = require('./lib/get-const-val.js');

const Const = {

  ColTypeData: 0,
  ColTypeLabel: 1,
  ColTypeBlank: 2,

  AlignTypeNeutral: 0,
  AlignTypeLeft: 1,
  AlignTypeCenter: 2,
  AlignTypeRight: 3,
  AlignTypeJustify: 4,
  
  SectionTypeThead: 1,
  SectionTypeTbody: 2, // default in database
  SectionTypeTfoot: 3

};

Const.ColTypes = [
  { 'data': Const.ColTypeData },
  { 'label': Const.ColTypeLabel },
  { 'blank': Const.ColTypeBlank }
];

Const.AlignTypes = [
  { 'neutral': Const.AlignTypeNeutral },
  { 'left': Const.AlignTypeLeft },
  { 'center': Const.AlignTypeCenter },
  { 'right': Const.AlignTypeRight },
  { 'justify': Const.AlignTypeJustify }
];

Const.SectionTypes = [
  { 'thead': Const.SectionTypeThead },
  { 'tbody': Const.SectionTypeTbody },
  { 'tfoot': Const.SectionTypeTfoot }
];

Const.getVal = getVal;

module.exports = Const;

