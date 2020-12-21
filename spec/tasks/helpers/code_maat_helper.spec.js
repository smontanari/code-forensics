var Helper   = require('tasks/helpers/code_maat_helper'),
    codeMaat = require('analysers/code_maat');

describe('CodeMaatHelper', function() {
  var subject, mockAnalyser;
  beforeEach(function() {
    subject = new Helper({});
    mockAnalyser =  {
      isSupported: jest.fn().mockReturnValue('support-info'),
      fileAnalysisStream: jest.fn().mockReturnValue('test_result')
    };
    codeMaat.analyser = jest.fn().mockReturnValue(mockAnalyser);
  });

  Object.entries({
    'revisions': 'revisionsAnalysis',
    'summary': 'summaryAnalysis',
    'soc': 'sumCouplingAnalysis',
    'coupling': 'temporalCouplingAnalysis',
    'authors': 'authorsAnalysis',
    'main-dev': 'mainDevAnalysis',
    'entity-effort': 'effortAnalysis',
    'entity-ownership': 'codeOwnershipAnalysis',
    'communication': 'communicationAnalysis',
    'abs-churn': 'absoluteChurnAnalysis',
    'entity-churn': 'entityChurnAnalysis'
  }).forEach(function(entry) {
    var instruction = entry[0], analysis = entry[1];
    it('returns information on vcs support', function() {
      expect(subject[analysis].isSupported()).toEqual('support-info');
    });

    it('returns the codemaat analysis of the input file', function() {
      var result = subject[analysis]('test_log_input', 'test_group_input', 'test_options');

      expect(result).toEqual('test_result');
      expect(codeMaat.analyser).toHaveBeenCalledWith(instruction);
      expect(mockAnalyser.fileAnalysisStream).toHaveBeenCalledWith('test_log_input', 'test_group_input', 'test_options');
    });
  });
});
