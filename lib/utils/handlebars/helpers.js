const textile = require('textile-js');
const mergeCustomConfigEnv = require('../../utils/merge-custom-config-env.js');
//const log = require('mk-log');
const fileExistsAtPath = require('../../utils/file-exists-at-path.js');
//const dataUriCache = new Map();
const Path = require('path');
const fs = require('fs');
const srcRootDir = Path.resolve('src');

module.exports = {
  foo() {
    return 'foo';
  },
  json(obj) {
    if (!obj) return '';
    return JSON.stringify(obj);
  },
  ifEnv(env, options) {
    if (env === process.env.NODE_ENV) {
      return options.fn();
    }
  },
  textile(s) {
    if (!s) return '';
    return textile(s);
  },
  fileext(s, extension) {
    if (!s) return '';
    return s.replace(/\..*$/i, `.${extension}`);
  },
  when(compA, operator, compB, options) {
    const operators = {
      eq(l, r) {
        return l == r;
      },
      noteq(l, r) {
        return l != r;
      },
      gt(l, r) {
        return Number(l) > Number(r);
      },
      or(l, r) {
        return l || r;
      },
      and(l, r) {
        return l && r;
      },
      '%'(l, r) {
        return l % r === 0;
      },
    };
    const result = operators[operator](compA, compB);

    if (result) return options.fn(this);
    else return options.inverse(this);
  },
  submenuFor(menu, pattern, reqPath, options) {
    for (let i = 0, l = menu.length; i < l; i++) {
      const menuItem = Object.assign({}, menu[i]);
      if (menuItem.url.indexOf(pattern) === 0 && menuItem.menu) {
        return options.fn(menuItem);
      }
    }
  },
  // Use case for loaderData:
  // get loader data in other uri than
  // on the primary reqested one e.g.
  // menu data was requested on uri /
  // but is needed on other pages too
  loaderData(uriPath, pathsStore, options) {
    if (!pathsStore) return false;
    const pathsIntents = pathsStore.paths.get(uriPath);
    if (!pathsIntents) return false;
    const loader = pathsIntents.get('loader');
    if (!loader) return false;
    return options.fn(loader);
  },
  menu(menu, reqPath, options) {
    if (!menu) return 'No menu items passed to menu helper';
    let result = '';
    for (let i = 0, l = menu.length; i < l; i++) {
      const menuItem = Object.assign({}, menu[i]);
      menuItem.active = menuItem.url === reqPath;
      result += options.fn(menuItem);
    }
    return result;
  },
  configVal(config, key) {
    const mergedConfig = mergeCustomConfigEnv(config);
    return mergedConfig[key];
  },
  formErrors(title, errors, options) {
    if (!errors) return '';

    let errList = '<div class="form-errors label--1">';
    errList += `<h2 class="form-errors__hl">${title}</h2>`;
    errList += '<ul class="form-errors__list">';
    for (let i = 0, l = errors.length; i < l; i++) {
      errList = errList + options.fn(errors[i].msg);
    }
    return (errList += '</ul></div>');
  },
  fieldError(fieldName, errors, options) {
    if (!errors) return '';

    let errList = '';
    for (let i = 0, l = errors.length; i < l; i++) {
      if (errors[i].param === fieldName) {
        errList = errList + options.fn(errors[i].msg);
      }
    }
    return errList;
  },
  interpolateDate(s) {
    let result = s;
    const now = new Date();
    result = result.replace('%%year%%', now.getFullYear());
    result = result.replace('%%month%%', now.getMonth() + 1);
    return result;
  },
  includeInline(uriPath) {
    const srcPath = Path.join(srcRootDir, uriPath);
    if (!fileExistsAtPath(srcPath)) return `can't find file at path ${uriPath}`;
    const s = fs.readFileSync(srcPath, 'utf8');
    let result = s;
    if (uriPath.match(/\.svg$/i) && s.match(/^<\?xml /)) {
      // don't do xml doc definition in html
      result = s.split('\n').slice(1).join('\n');
    }
    return result;
  },

  // currently only works with svgs
  // use readFileSync without utf8 for
  // reading binary/buffer
  /* 
  buildDataUri(uriPath) {
    let dataUri = dataUriCache.get(uriPath);
    if (dataUri) {
      return dataUri;
    }
    if (!fileExistsAtPath(uriPath)) return `can't find file at path ${uriPath}`;
    const filePath = Path.join(srcRootDir, uriPath);
    const dataSrc = fs.readFileSync(filePath); 
    const base64 = dataSrc.toString();

  },
  */
};
