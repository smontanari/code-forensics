var FlogAnalyser = require('./flog_analyser'),
    FlogParser   = require('./flog_parser'),
    utils        = require('../../utils');

var factory = new utils.SingletonFactory(FlogAnalyser);

module.exports = {
  analyser: function() {
     return factory.instance(new FlogParser());
  }
};
