var _ = require('lodash');

module.exports = function() {
  var wordHash = {};

  this.addWords = function(words) {
    _.each(words, function(word) {
      wordHash[word] = (wordHash[word] || 0) + 1;
    });
  };

  this.report = function() {
    var words = _.reduce(wordHash, function(list, value, word) {
      list.push({ text: word, count: value });
      return list;
    }, []);
    return _.sortBy(words, function(w) { return -w.count; });
  };
};
