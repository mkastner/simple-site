const cssRegex = /href="(\/.*?\.css)"/gim;
// regex rule fetch all js files where
// basename consists only of letters
const jsRegex = /"(\/.*?\.js)"/gim;
//const svgRegex = /((?:"|,)\s*(\/.*?\.svg))/gim;
const svgRegex = /(?:("|')|,)\s*(\.*\/.*?\.svg)/gim;
const woffRegex = /href="(.*?\.woff)"/gim;
const justCopyRegex = /(src|href)="(\/.*?\.(jp(e?)g|png|gif|ico))"/gim;

module.exports = {
  cssRegex,
  jsRegex,
  svgRegex,
  woffRegex,
  justCopyRegex,
};
