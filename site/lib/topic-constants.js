const getVal = require('./get-const-val.js');

const Const = {
  
  TagTypeDiv       :0,
  TagTypeHeader    :1,
  TagTypeNav       :2,
  TagTypeSection   :3,
  TagTypeArticle   :4,
  TagTypeAside     :5,
  TagTypeFigure    :6,
  TagTypeFigCaption:7,
  TagTypeFooter    :8,
  TagTypeDetails   :9,
  TagTypeSummary   :10,
  TagTypeMark      :11,
  TagTypeTime      :12,
  TagTypeA         :13,
  TagTypeMain      :14,
  TagTypeNone      :15,
  TagTypeHr        :16,
  TagTypeSpan      :17,

  HeadlineTagTypeH1: 0,
  HeadlineTagTypeH2: 1,
  HeadlineTagTypeH3: 2,
  HeadlineTagTypeH4: 3,
  HeadlineTagTypeH5: 4,
  HeadlineTagTypeH6: 5,

  ContentTypeTopic: 0,
  ContentTypeArticle: 1,
  ContentTypeShort: 2,
  ContentTypeOutdated: 3, // this is used for outdated
  ContentTypeSegment: 4 
};

Const.TagTypes = [
  { 'div': Const.TagTypeDiv },
  { 'header': Const.TagTypeHeader },
  { 'nav': Const.TagTypeNav },
  { 'section': Const.TagTypeSection },
  { 'article': Const.TagTypeArticle },
  { 'aside': Const.TagTypeAside },
  { 'figure': Const.TagTypeFigure },
  { 'caption': Const.TagTypeFigCaption },
  { 'footer': Const.TagTypeFooter },
  { 'details': Const.TagTypeDetails },
  { 'summary': Const.TagTypeSummary },
  { 'mark': Const.TagTypeMark },
  { 'time': Const.TagTypeTime },
  { 'a': Const.TagTypeA },
  { 'main': Const.TagTypeMain },
  { 'none': Const.TagTypeNone},
  { 'hr': Const.TagTypeHr},
  { 'span': Const.TagTypeSpan}
];


Const.HeadlineTagTypes = [
  { h1: Const.HeadlineTagTypeH1},
  { h2: Const.HeadlineTagTypeH2},
  { h3: Const.HeadlineTagTypeH3},
  { h4: Const.HeadlineTagTypeH4},
  { h5: Const.HeadlineTagTypeH5},
  { h6: Const.HeadlineTagTypeH6}
];

Const.ContentTypes = [
  { topic: Const.ContentTypeTopic},
  { article: Const.ContentTypeArticle},
  { short: Const.ContentTypeShort},
  { outdated: Const.ContentTypeOutdated},
  { segment: Const.ContentTypeSegment}
];

Const.getVal = getVal; 

module.exports = Const;
