module.exports = function() {
  if (window.navigator.languages) {
    return window.navigator.languages[0];
  }
  return window.navigator.language;
};
