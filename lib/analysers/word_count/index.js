var WordCountAnalyser = require('./word_count_analyser'),
    utils             = require('../../utils');

var factory = new utils.SingletonFactory(WordCountAnalyser);

module.exports = {
  analyser: function() {
    return factory.instance();
  }
};
