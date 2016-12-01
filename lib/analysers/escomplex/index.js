var ESComplexAnalyser = require('./escomplex_analyser'),
    utils             = require('../../utils');

var factory = new utils.SingletonFactory(ESComplexAnalyser);

module.exports = {
  analyser: function() {
    return factory.instance();
  }
};
