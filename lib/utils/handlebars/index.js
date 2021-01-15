const Handlebars = require('handlebars');
const fs = require('fs').promises;
const helpers = require('./helpers'); 
// const log = require('mk-log');
Handlebars.registerHelper(helpers);

module.exports = async function renderHbs(templatePath, data) {

  const rawTemplate = await fs.readFile(templatePath, 'utf8'); 
  const template = Handlebars.compile(rawTemplate);
  const replacedText = template(data);
  return replacedText;

};

