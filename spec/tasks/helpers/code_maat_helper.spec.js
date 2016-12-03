var _ = require('lodash');

var Helper   = require_src('tasks/helpers/code_maat_helper'),
    codeMaat = require_src('analysers/code_maat');

describe('CodeMaatHelper', function() {
  beforeEach(function() {
    this.subject = new Helper({});
    this.mockAnalyser =  {
      fileAnalysisStream: jasmine.createSpy().and.returnValue('test_result')
    };
    spyOn(codeMaat, 'analyser').and.returnValue(this.mockAnalyser);
  });

  _.each({
    revisionsAnalysis:        'revisions',
    sumCouplingAnalysis:      'soc',
    temporalCouplingAnalysis: 'coupling',
    authorsAnalysis:          'authors',
    mainDevAnalysis:          'main-dev',
    effortAnalysis:           'entity-effort',
    codeOwnershipAnalysis:    'entity-ownership',
    communicationAnalysis:    'communication',
    absoluteChurnAnalysis:    'absolute-churn',
    entityChurnAnalysis:      'entity-churn'
  }, function(instruction, analysis) {
    it('returns the codemaat analysis of the input file', function() {
      var result = this.subject[analysis]('test_input', 'test_options');

      expect(result).toEqual('test_result');
      expect(this.mockAnalyser.fileAnalysisStream).toHaveBeenCalledWith('test_input', 'test_options');
    });
  });
});
