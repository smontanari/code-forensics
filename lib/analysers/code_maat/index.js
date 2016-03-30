var CodeMaatAnalyser = require('./code_maat_analyser');

module.exports = {
  revisionsReporter:        new CodeMaatAnalyser('revisions'),
  sumCouplingReporter:      new CodeMaatAnalyser('soc'),
  temporalCouplingReporter: new CodeMaatAnalyser('coupling'),
  authorsReporter:          new CodeMaatAnalyser('authors'),
  ownershipReporter:        new CodeMaatAnalyser('entity-ownership')
};
