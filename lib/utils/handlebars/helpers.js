const textile = require('textile-js');
const mergeCustomConfigEnv = require('../../utils/merge-custom-config-env.js');
const log = require('mk-log');

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
    if (!loader.data) return false;
    log.info('loader.data', loader.data);
    return options.fn(loader.data);
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
};
