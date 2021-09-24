const getVal = require('./get-const-val.js');

const SamplingFactor = '-sampling-factor 4:2:0 -quality 80 -strip';

const Const = {

  MediaTypeImage: 0,
  MediaTypeVideo: 1,
  MediaTypeDoc: 2, 
  
  StyleTypeLarge: { size: '560x>', format: 'jpg', samplingFactor: SamplingFactor},
  StyleTypeWide: { size: '310x>', format: 'jpg', samplingFactor: SamplingFactor},
  StyleTypeSpecial: { size: '225x>', format: 'jpg', samplingFactor: SamplingFactor},
  StyleTypeBig: { size: '190x>', format: 'jpg', samplingFactor: SamplingFactor},
  StyleTypeTeaser: { size: '172x>', format: 'jpg', samplingFactor: SamplingFactor},
  StyleTypeMedium: { size: '150x>', format: 'jpg', samplingFactor: SamplingFactor},
  StyleTypeSmallTeaser: { size: '120x>', format: 'jpg', samplingFactor: SamplingFactor},
  StyleTypeSmall: { size: '75x>',  format: 'jpg', samplingFactor: SamplingFactor}, 
  StyleTypeThumb: { size: '32x>', format: 'jpg', convert: SamplingFactor}

};

Const.MediaTypes = [
  { image: Const.MediaTypeImage },
  { video: Const.MediaTypeVideo },
  { doc: Const.MediaTypeDoc }
];

Const.StyleTypes = [
  { large: Const.StyleTypeLarge },
  { wide: Const.StyleTypeWide },
  { special: Const.StyleTypeSpecial },
  { big: Const.StyleTypeBig },
  { teaser: Const.StyleTypeTeaser },
  { medium: Const.StyleTypeMedium },
  { small_teaser: Const.StyleTypeSmallTeaser },
  { small: Const.StyleTypeSmall },
  { thumb: Const.StyleTypeThumb }
];

Const.getVal = getVal;

module.exports = Const;
