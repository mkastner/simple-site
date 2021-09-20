(function () {
  // using handlebars as asset proprocesor
  if (FontFace === 'undefined') {
    alert(
      'It looks as if your browser is outdated. You might want to ask your local dealer for a newer one.'
    );
  }
  const robotoMedium = new FontFace(
    'Roboto-Medium',
    'url({{assetUri}}/fonts/Roboto-Medium.woff)'
  );
  const robotoRegular = new FontFace(
    'Roboto-Regular',
    'url({{assetUri}}/fonts/Roboto-Regular.woff)'
  );
  const robotoLight = new FontFace(
    'Roboto-Light',
    'url({{assetUri}}/fonts/Roboto-Light.woff)'
  );
  const robotoThin = new FontFace(
    'Roboto-Thin',
    'url({{assetUri}}/fonts/Roboto-Thin.woff)'
  );

  Promise.all([
    robotoMedium.load(),
    robotoRegular.load(),
    robotoLight.load(),
    robotoThin.load(),
  ])
    .then((results) => {
      results.forEach((fontFace) => {
        document.fonts.add(fontFace);
      });
    })
    .catch((err) => {
      console.error(err);
    });

  console.log('I am a running script.');
})();
