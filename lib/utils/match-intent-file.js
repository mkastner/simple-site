const regExp = /\/([a-zA-Z-_]+?)\.(\w+?)\.\w+?$/;

module.exports = function matchIntentFile(filePath) {
  const match = regExp.exec(filePath);
  return {
    name() {
      return match[1];
    },
    intent() {
      return match[2];
    },
    extension() {
      return match[3];
    },
  };
};
