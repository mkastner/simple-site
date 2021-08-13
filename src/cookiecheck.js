(function () {
  function allCookies() {
    var pairs = document.cookie.split(';');
    var result = {};
    for (var i = 0, l = pairs.length; i < l; i++) {
      var pair = pairs[i].split('=');
      var key = pair[0];
      var value = pair[1];
      result[key.trim()] = value;
    }
    return result;
  }

  function removeCookie(key) {
    var expiration = new Date('1970-01-01');
    var expires = 'expires=' + expiration.toUTCString();
    var cookieString =
      key + '=true;' + 'expires=' + expires + ';path=/;domain=fmh.de;secure';
    document.cookie = cookieString;
  }

  function preventYouTube() {
    document.addEventListener('DOMContentLoaded', function () {
      var iframes = document.querySelectorAll('iframe');
      for (var i = 0, l = iframes.length; i < l; i++) {
        iframes[i].src = '';
      }
    });
  }

  function preventGoogleAnalytics() {
    removeCookie('_ga');
    removeCookie('_gid');
    removeCookie('gat_gtag_UA_15228411_1');
  }

  function allowGoogleAnalytics() {
    console.log('cookieconfirm allows analytics/tag manager');
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', 'UA-15228411-1', { anonymize_ip: true });
  }

  function preventMarketing() {
    // no implemented
  }

  var cookie = document.cookie;

  // check cookieconfirm-browser-db in beacon js
  // check if any cookie named cookieconfirm is set
  if (!cookie.match(/cookieconfirm/)) {
    preventYouTube();
    preventGoogleAnalytics();
  }
  if (cookie.match(/cookieconfirm-marketing/)) {
    // no marketing cookies yet
  } else {
    preventMarketing();
  }
  if (cookie.match(/cookieconfirm-analysis/)) {
    allowGoogleAnalytics();
  } else {
    preventGoogleAnalytics();
  }
})();
