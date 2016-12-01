var SlocAnalyser = require('./sloc_analyser'),
    utils        = require('../../utils');

var factory = new utils.SingletonFactory(SlocAnalyser);

module.exports = {
  analyser: function() {
    return factory.instance();
  }
};
