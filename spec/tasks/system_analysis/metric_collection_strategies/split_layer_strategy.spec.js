/*global require_src*/
var _      = require('lodash'),
    stream = require('stream'),
    moment = require('moment');

var splitLayerStrategy = require_src('tasks/system_analysis/metric_collection_strategies/split_layer_strategy'),
    TimePeriod         = require_src('models/time_interval/time_period'),
    LayerGrouping      = require_src('models/layer_grouping');

describe('splitLayerStrategy', function() {
  describe('metrics collection', function() {
    var strategyFn, mockFilesHelper, mockStreamProcessor, mockCodeMaatHelper, testAnalysisStream, streamsData, strategyAnalysisFn;

    var assertStream = function() {
      it('merges the streams of the individual layers analysis', function(done) {
        var output = strategyFn(['p1', 'p2']);

        expect(output).toEqual('test_output');
        expect(mockStreamProcessor.mergeAll)
          .toHaveBeenCalledWith([
            { timePeriod: 'p1', layer: jasmine.objectContaining({ name: 'test-layer-1', value: 'Test Layer 1' }) },
            { timePeriod: 'p1', layer: jasmine.objectContaining({ name: 'test-layer-2', value: 'Test Layer 2' }) },
            { timePeriod: 'p1', layer: jasmine.objectContaining({ name: 'test-layer-3', value: 'Test Layer 3' }) },
            { timePeriod: 'p2', layer: jasmine.objectContaining({ name: 'test-layer-1', value: 'Test Layer 1' }) },
            { timePeriod: 'p2', layer: jasmine.objectContaining({ name: 'test-layer-2', value: 'Test Layer 2' }) },
            { timePeriod: 'p2', layer: jasmine.objectContaining({ name: 'test-layer-3', value: 'Test Layer 3' }) }
          ], jasmine.any(Function));

        var timePeriod = new TimePeriod({ start: moment('2010-05-01 00Z'), end: moment('2010-05-31 00Z') }, 'DD-MM-YYYY');
        var data = [];
        strategyAnalysisFn({ timePeriod: timePeriod, layer: { name: 'test-layer', value: 'Test Layer' } })
          .on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              { name: 'Test Layer', metric1: 10, metric2:  5, date: '2010-05-31T00:00:00.000Z' }
            ]);

            expect(mockFilesHelper.vcsNormalisedLog).toHaveBeenCalledWith(timePeriod);
            expect(mockCodeMaatHelper.testAnalysis).toHaveBeenCalledWith('test_vcs_log', { '-g': 'test-layer.txt' });
            done();
          });

        _.each(streamsData, function(v) {
          testAnalysisStream.push(v);
        });
        testAnalysisStream.end();
      });
    };

    beforeEach(function() {
      testAnalysisStream = new stream.PassThrough({ objectMode: true });

      mockFilesHelper = {
        vcsNormalisedLog: jasmine.createSpy().and.returnValue('test_vcs_log'),
        layerGrouping: function(name) { return name + '.txt'; }
      };
      mockCodeMaatHelper = {
        testAnalysis: jasmine.createSpy('testAnalysis')
      };
      mockCodeMaatHelper.testAnalysis.and.returnValue(testAnalysisStream);
      mockStreamProcessor = {
        mergeAll: jasmine.createSpy('mergeAll').and.callFake(function(_, fn) {
          strategyAnalysisFn = fn;
          return 'test_output';
        })
      };

      strategyFn = splitLayerStrategy(
        mockStreamProcessor,
        { files: mockFilesHelper, codeMaat: mockCodeMaatHelper },
        {
          metrics: {
            selector: function(obj) { return { metric1: obj.testMetricA, metric2: obj.testMetricC }; },
            defaultValue: { metric1: 2, metric2: 3 }
          },
          analysis: 'testAnalysis',
          layerGrouping: new LayerGrouping([{ name: 'Test Layer 1' }, { name: 'Test Layer 2' }, { name: 'Test Layer 3' }])
        }
      );
    });

    describe('Layer split metrics', function() {
      beforeEach(function() {
        streamsData = [
          { testMetricA: 10 },
          { testMetricB: 'abc' },
          { testMetricC: 5 }
        ];
      });

      assertStream();
    });

    describe('Layer aggregated metrics', function() {
      beforeEach(function() {
        streamsData = [
          { path: 'Test Layer', testMetricA: 10, testMetricB: 'abc', testMetricC: 5 }
        ];
      });
      assertStream();
    });
  });
});
