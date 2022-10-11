const replaceUris = {
  '/templates/tagesgeld':
    'https://tagesgeld.der-markt.com/rechner/dermarkt/schnellcheck.aspx',
  '/templates/festgeld':
    'https://festgeld.der-markt.com/rechner/dermarkt/schnellcheck.aspx',
  '/templates/hypotheken':
    'https://hypotheken.der-markt.com/rechner/dermarkt/schnellcheck.aspx',
};

// sitemap.js autoloads hook
// /site/lib/hooks/sitemap-uri.js
// if when existing
// manipulate uriPath if neccessary

module.exports = function sitemapUri(uriPath) {
  if (replaceUris[uriPath]) {
    return replaceUris[uriPath];
  }
  return uriPath;
};
