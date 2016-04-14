var reportHelper = require_src('tasks/helpers/report_helper'),
    reporting = require_src('reporting');

describe('reportHelper', function() {
  describe('.hotspotAnalysis()', function() {
    var mockComposer;
    beforeEach(function() {
      mockComposer = jasmine.createSpyObj('composer', ['mergeWith', 'buildReport']);
      spyOn(reporting, 'ReportComposer').and.returnValue(mockComposer);
      mockComposer.buildReport.and.returnValue('test-report');
    });

    it('uses a path matching function in the composer', function() {
      mockComposer.mergeWith.and.callFake(function(file, fn, prop) {
        expect(fn({path: 'test/path'}, {path: 'test/path'})).toBe(true);
        expect(fn({path: 'test/path1'}, {path: 'test/path2'})).toBe(false);
        return mockComposer;
      });

      reportHelper.hotspotAnalysis('slocFile', 'revisionsFile', ['complexityFile1', 'complexityFile2']);
    });

    it('composes a report out of the given data sources', function() {
      var output = reportHelper.hotspotAnalysis('slocFile', 'revisionsFile', ['complexityFile1', 'complexityFile2']);

      expect(output).toEqual('test-report');

      expect(reporting.ReportComposer).toHaveBeenCalledWith('slocFile');
      expect(mockComposer.mergeWith).toHaveBeenCalledWith('revisionsFile', jasmine.any(Function), 'revisions');
      expect(mockComposer.mergeWith).toHaveBeenCalledWith('complexityFile1', jasmine.any(Function), 'totalComplexity');
      expect(mockComposer.mergeWith).toHaveBeenCalledWith('complexityFile2', jasmine.any(Function), 'totalComplexity');
    });
  });
});
