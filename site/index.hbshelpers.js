module.exports = {
  preferredTitle(topic) {
    return topic.page_title || topic.title;
  },
};
