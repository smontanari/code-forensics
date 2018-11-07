/*global require_src*/
var _      = require('lodash'),
    stream = require('stream'),
    moment = require('moment');

var splitLayerStrategy = require_src('tasks/system_analysis/metric_collection_strategies/split_layer_strategy'),
    TimePeriod         = require_src('models/time_interval/time_period'),
    LayerGrouping      = require_src('models/layer_grouping');

describe('splitLayerStrategy', function() {
  describe('metrics collection', function() {
    var collectFn, mockFilesHelper, mockCodeMaatHelper, testAnalysisStreams, streamsData;

    var assertStream = function() {
      it('merges the streams of the individual layers analysis', function(done) {
        var timePeriod = new TimePeriod({ start: moment('2010-05-01 00Z'), end: moment('2010-05-31 00Z') }, 'DD-MM-YYYY');
        var data = [];
        collectFn(timePeriod)
          .on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              jasmine.objectContaining({ name: 'Test Layer 1', metric1: 10, metric2:  5, date: '2010-05-31T00:00:00.000Z' }),
              jasmine.objectContaining({ name: 'Test Layer 2', metric1:  2, metric2:  3, date: '2010-05-31T00:00:00.000Z' }),
              jasmine.objectContaining({ name: 'Test Layer 3', metric1: 50, metric2: 25, date: '2010-05-31T00:00:00.000Z' })
            ]);

            expect(mockFilesHelper.vcsNormalisedLog).toHaveBeenCalledWith(timePeriod);
            expect(mockCodeMaatHelper.testAnalysis).toHaveBeenCalledWith('test_vcs_log', { '-g': 'test-layer-1.txt' });
            expect(mockCodeMaatHelper.testAnalysis).toHaveBeenCalledWith('test_vcs_log', { '-g': 'test-layer-2.txt' });
            expect(mockCodeMaatHelper.testAnalysis).toHaveBeenCalledWith('test_vcs_log', { '-g': 'test-layer-3.txt' });
            done();
          });

        _.each(testAnalysisStreams, function(s, index) {
          _.each(streamsData[index], function(v) {
            s.push(v);
          });
          s.end();
        });
      });
    };

    beforeEach(function() {
      testAnalysisStreams = [
        new stream.PassThrough({ objectMode: true }),
        new stream.PassThrough({ objectMode: true }),
        new stream.PassThrough({ objectMode: true })
      ];

      mockFilesHelper = {
        vcsNormalisedLog: jasmine.createSpy().and.returnValue('test_vcs_log'),
        layerGrouping: function(name) { return name + '.txt'; }
      };
      mockCodeMaatHelper = {
        testAnalysis: jasmine.createSpy('testAnalysis')
      };
      mockCodeMaatHelper.testAnalysis.and.returnValues.apply(mockCodeMaatHelper.testAnalysis.and, testAnalysisStreams);

      collectFn = splitLayerStrategy(
        {
          selector: function(obj) { return { metric1: obj.testMetricA, metric2: obj.testMetricC }; },
          defaultValue: { metric1: 2, metric2: 3 }
        },
        'testAnalysis',
        { files: mockFilesHelper, codeMaat: mockCodeMaatHelper },
        new LayerGrouping([{ name: 'Test Layer 1' }, { name: 'Test Layer 2' }, { name: 'Test Layer 3' }])
      );
    });

    describe('Layer split metrics', function() {
      beforeEach(function() {
        streamsData = [
          [
            { testMetricA: 10 },
            { testMetricB: 'abc' },
            { testMetricC: 5 }
          ],
          [
            { testMetricB: 'xyz' },
          ],
          [
            { testMetricA: 50 },
            { testMetricB: 'xyz' },
            { testMetricC: 25 }
          ]
        ];
      });

      assertStream();
    });

    describe('Layer aggregated metrics', function() {
      beforeEach(function() {
        streamsData = [
          [
            { path: 'Test Layer 1', testMetricA: 10, testMetricB: 'abc', testMetricC: 5 }
          ],
          [
            { path: 'Test Layer 2', testMetricB: 'xyz' }
          ],
          [
            { path: 'Test Layer 3', testMetricA: 50, testMetricB: 'xyz', testMetricC: 25 }
          ]
        ];
      });
      assertStream();
    });
  });
});
