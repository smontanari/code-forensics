var CodeMaatAnalyser = require('./code_maat_analyser'),
    utils            = require('../../utils');

var factory = new utils.SingletonFactory(CodeMaatAnalyser);

module.exports = {
  analyser: function(parserInstruction) {
    return factory.instance(parserInstruction);
  }
};
