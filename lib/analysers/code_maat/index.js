var CodeMaatAnalyser = require('./code_maat_analyser');

module.exports = {
  revisionsAnalyser:        new CodeMaatAnalyser('revisions'),
  sumCouplingAnalyser:      new CodeMaatAnalyser('soc'),
  temporalCouplingAnalyser: new CodeMaatAnalyser('coupling'),
  authorsAnalyser:          new CodeMaatAnalyser('authors'),
  ownershipAnalyser:        new CodeMaatAnalyser('entity-ownership')
};
