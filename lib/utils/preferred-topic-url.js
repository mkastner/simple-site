function preferredTopicUrl(topic) {
  if (!topic) {
    console.warn('utils/preferred-topic-url expected topic but got:', topic);
    return '/no-topic-given-for-preferred-topic-url';
  }

  let externals = topic.externals;

  if (externals && externals.length) {
    return externals[0].url;
  }

  let urls = topic.urls;

  if (urls && urls.length) {
    // they are NOT sorted in api
    //urls.sort((a, b) => { return a.position - b.position; });
    return urls[0].permalink;
  }

  return `/no-url-set-for-topic-${topic.id}`;
}

module.exports = preferredTopicUrl;
