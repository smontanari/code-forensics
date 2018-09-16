/*global require_src*/
var stream = require('stream'),
    moment = require('moment');

var multiLayerStrategy = require_src('tasks/system_analysis/metric_collection_strategies/multi_layer_strategy'),
    TimePeriod         = require_src('models/time_interval/time_period');

describe('multiLayerStrategy', function() {
  describe('metrics collection', function() {
    var strategyFn, mockFilesHelper, mockStreamProcessor, mockCodeMaatHelper, testAnalysisStream, strategyAnalysisFn;

    beforeEach(function() {
      testAnalysisStream = new stream.PassThrough({ objectMode: true });

      mockFilesHelper = {
        vcsNormalisedLog: jasmine.createSpy().and.returnValue('test_vcs_log'),
        layerGrouping: function() { return 'test_group_file.txt'; }
      };
      mockCodeMaatHelper = {
        testAnalysis: jasmine.createSpy('testAnalysis').and.returnValue(testAnalysisStream)
      };
      mockStreamProcessor = {
        mergeAll: jasmine.createSpy('mergeAll').and.callFake(function(_, fn) {
          strategyAnalysisFn = fn;
          return 'test_output';
        })
      };

      strategyFn = multiLayerStrategy(
        mockStreamProcessor,
        { files: mockFilesHelper, codeMaat: mockCodeMaatHelper },
        {
          metrics: {
            selector: function(obj) { return { metric1: obj.testMetricA, metric2: obj.testMetricC }; }
          },
          analysis: 'testAnalysis'
        }
      );
    });

    it('maps the stream data', function(done) {
      var output = strategyFn(['p1', 'p2']);

      expect(output).toEqual('test_output');
      expect(mockStreamProcessor.mergeAll).toHaveBeenCalledWith(['p1', 'p2'], jasmine.any(Function));

      var timePeriod = new TimePeriod({ start: moment('2010-05-01 00Z'), end: moment('2010-05-31 00Z') }, 'DD-MM-YYYY');
      var data = [];
      strategyAnalysisFn(timePeriod)
        .on('data', function(obj) { data.push(obj); })
        .on('end', function() {
          expect(data).toEqual([
            jasmine.objectContaining({ name: 'path1', metric1: 10, metric2: 5, date: '2010-05-31T00:00:00.000Z' }),
            jasmine.objectContaining({ name: 'path2', metric1: 50, metric2: 25, date: '2010-05-31T00:00:00.000Z' })
          ]);

          expect(mockFilesHelper.vcsNormalisedLog).toHaveBeenCalledWith(timePeriod);
          expect(mockCodeMaatHelper.testAnalysis).toHaveBeenCalledWith('test_vcs_log', { '-g': 'test_group_file.txt' });
          done();
        });

      testAnalysisStream.push({ path: 'path1', testMetricA: 10, testMetricB: 'abc', testMetricC: 5 });
      testAnalysisStream.push({ path: 'path2', testMetricA: 50, testMetricB: 'xyz', testMetricC: 25 });
      testAnalysisStream.end();
    });
  });
});
