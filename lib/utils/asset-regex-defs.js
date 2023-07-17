const cssRegex = /href="(\/.*?\.css)"/gim;
// regex rule fetch all js files where
// basename consists only of letters
const jsRegex = /"(\/.*?\.js)"/gim;
//const svgRegex = /((?:"|,)\s*(\/.*?\.svg))/gim;
const svgRegex = /(?:("|')|,)\s*(\.*\/.*?\.svg)/gim;
const woffHtmlRegex = /href="(.*?\.woff)"/gim;
const woffCssRegex = /url\("(.*?\.woff)"\)/gim;
const justCopyRegex = /(src|href)="(\/.*?\.(jp(e?)g|png|gif|ico))"/gim;

module.exports = {
  cssRegex,
  jsRegex,
  svgRegex,
  woffHtmlRegex,
  woffCssRegex,
  justCopyRegex,
};
