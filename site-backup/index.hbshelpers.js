const TopicConstants = require('./lib/topic-constants.js');

function camelize(s) {
  return s.replace(/(?:^|_)(.)/, (_m, $1) => {
    return $1.toUpperCase();
  });
}

function preferredDocTitle(document) {
  return document?.title || document?.paper?.title;
}

module.exports = {
  preferredTitle(topic) {
    return topic.page_title || topic.title;
  },
  ifShow(topic, textType, options) {
    if (textType === 'title' && !topic.hide_title_on_page) {
      return options.fn(this);
    }
    if (
      textType === 'abstract' &&
      !topic.hide_abstract_on_page &&
      topic.abstract
    ) {
      return options.fn(this);
    }
    if (textType === 'description' && topic.description) {
      return options.fn(this);
    }
  },
  textFor(topic, textType) {
    if (topic[`${textType}_formatted`]) {
      return topic[`formatted${camelize(textType)}`];
    }
    return topic[textType];
  },
  tagName(topic, attrName) {
    return TopicConstants.getVal('TagTypes', topic[attrName]); 
  },
  eachDocument(documents, size, options) {
    let ret = '';
    for (let i = 0, l = documents.length; i < l; i++) {
      ret += options.fn({title: preferredDocTitle(documents[i])});
    }
    return ret;
  } 
};
