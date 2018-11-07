/*global require_src*/
var stream = require('stream'),
    moment = require('moment');

var noLayerStrategy = require_src('tasks/system_analysis/metric_collection_strategies/no_layer_strategy'),
    TimePeriod      = require_src('models/time_interval/time_period');

describe('noLayerStrategy', function() {
  describe('metrics collection', function() {
    var collectFn, mockFilesHelper, mockCodeMaatHelper, testAnalysisStream;

    beforeEach(function() {
      testAnalysisStream = new stream.PassThrough({ objectMode: true });

      mockFilesHelper = {
        vcsNormalisedLog: jasmine.createSpy().and.returnValue('test_vcs_log')
      };
      mockCodeMaatHelper = {
        testAnalysis: jasmine.createSpy('testAnalysis').and.returnValue(testAnalysisStream)
      };

      collectFn = noLayerStrategy(
        {
          selector: function(obj) { return { metric1: obj.testMetricA, metric2: obj.testMetricC }; },
          defaultValue: { metric1: 0, metric2: 0 }
        },
        'testAnalysis',
        { files: mockFilesHelper, codeMaat: mockCodeMaatHelper }
      );
    });

    it('reduces the stream data', function(done) {
      var timePeriod = new TimePeriod({ start: moment('2010-05-01 00Z'), end: moment('2010-05-31 00Z') }, 'DD-MM-YYYY');
      var data = [];
      collectFn(timePeriod)
        .on('data', function(obj) { data.push(obj); })
        .on('end', function() {
          expect(data).toEqual([
            jasmine.objectContaining({ name: 'All files', metric1: 60, metric2: 30, date: '2010-05-31T00:00:00.000Z' }),
          ]);

          expect(mockFilesHelper.vcsNormalisedLog).toHaveBeenCalledWith(timePeriod);
          expect(mockCodeMaatHelper.testAnalysis).toHaveBeenCalledWith('test_vcs_log');
          done();
        });

      testAnalysisStream.push({ path: 'path1', testMetricA: 10, testMetricB: 'abc', testMetricC: 5 });
      testAnalysisStream.push({ path: 'path2', testMetricA: 50, testMetricB: 'xyz', testMetricC: 25 });
      testAnalysisStream.end();
    });
  });
});
