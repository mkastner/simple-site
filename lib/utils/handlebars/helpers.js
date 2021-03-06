module.exports = {
  foo() { return 'foo' },
  json(obj) {
    if (!obj) return '';
    return JSON.stringify(obj);
  },
  ifEnv(env, options) {
    if (env === process.env.NODE_ENV) {
      return options.fn();
    }
  }, 
  when( compA, operator, compB, options) {
    const operators = {
      eq(l,r) { return l == r; },
      noteq(l,r) { return l != r; },
      gt(l,r) { return Number(l) > Number(r); },
      or(l,r) { return l || r; },
      and(l,r) { return l && r; },
      '%'(l,r) { return (l % r) === 0; }
    };
    const result = operators[operator](compA,compB);

     if (result) return options.fn(this);
     else  return options.inverse(this);
  },
  submenuFor(menu, pattern, reqPath, options) {
    for (let i = 0, l = menu.length; i < l; i++) {
      const menuItem = Object.assign({}, menu[i]); 
      if (menuItem.url.indexOf(pattern) === 0 && menuItem.menu) {
        return options.fn(menuItem); 
      }
    }
  }, 
  menu(menu, reqPath, options) {
    if (!menu) return 'No menu items passed to menu helper';
    let result = ''; 
    for (let i = 0, l = menu.length; i < l; i++) {
      const menuItem = Object.assign({}, menu[i]); 
      menuItem.active = (menuItem.url === reqPath); 
      result += options.fn(menuItem); 
    }
    return result;
  }, 
  formErrors(title, errors, options) {

    if (!errors) return '';
    
    let errList = '<div class="form-errors label--1">'; 
    errList += `<h2 class="form-errors__hl">${title}</h2>`; 
    errList +=  '<ul class="form-errors__list">';
    for (let i = 0, l = errors.length; i < l; i++) {
      errList = errList + options.fn(errors[i].msg);
    }
    return errList +='</ul></div>';
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
  } 
}

