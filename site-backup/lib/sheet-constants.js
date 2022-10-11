const getVal = require('./get-const-val.js');

const Const = {

  TextTypeAbstractPreview:     0,
  TextTypeAbstractDescription: 1,
  TextTypeAbstractFulltext:    2,

  AlignmentTypeJustify:        0,
  AlignmentTypeLeft:           1,
  AlignmentTypeRight:          2,
  AlignmentTypeCenter:         3

};

Const.TextTypes = [ 
  {'preview': Const.TextTypeAbstractPreview},
  {'description': Const.TextTypeAbstractDescription},
  {'fulltext': Const.TextTypeAbstractFulltext},
];

Const.AlignmentTypes = [ 
  {'justify': Const.AlignmentTypeJustify},
  {'left': Const.AlignmentTypeLeft},
  {'right': Const.AlignmentTypeRight},
  {'center': Const.AlignmentTypeCenter}
];

Const.getVal = getVal; 

module.exports = Const;
