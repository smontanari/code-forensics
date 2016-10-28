var _                = require('lodash'),
    CodeMaatAnalyser = require('./code_maat_analyser');

module.exports = _.transform({
  revisionsAnalyser:        'revisions',
  sumCouplingAnalyser:      'soc',
  temporalCouplingAnalyser: 'coupling',
  authorsAnalyser:          'authors',
  mainDevAnalyser:          'main-dev',
  effortAnalyser:           'entity-effort',
  codeOwnershipAnalyser:    'entity-ownership'
}, function(newObj, value, key) { newObj[key] = new CodeMaatAnalyser(value); });
