var _                = require('lodash'),
    CodeMaatAnalyser = require('./code_maat_analyser'),
    utils            = require('../../utils');

_.each({
  revisionsAnalyser:        'revisions',
  sumCouplingAnalyser:      'soc',
  temporalCouplingAnalyser: 'coupling',
  authorsAnalyser:          'authors',
  mainDevAnalyser:          'main-dev',
  effortAnalyser:           'entity-effort',
  codeOwnershipAnalyser:    'entity-ownership'
}, function(parserInstruction, analyserName) {
  var factory = new utils.SingletonFactory(CodeMaatAnalyser);
  module.exports[analyserName] = function() {
    return factory.instance(parserInstruction);
  };
});
