/*global require_src*/
var _ = require('lodash'),
  stream = require('stream'),
  moment = require('moment');

var DataCollector = require_src('tasks/system_analysis/data_collector'),
    TimePeriod    = require_src('models/time_interval/time_period'),
    LayerGrouping = require_src('models/layer_grouping');

describe('DataCollector', function() {
  var subject, mockFilesHelper, mockCodeMaatHelper, testAnalysisStreams;

  var timePeriods = [
    new TimePeriod({ start: moment('2010-05-01 00Z'), end: moment('2010-05-31 00Z') }, 'DD-MM-YYYY'),
    new TimePeriod({ start: moment('2010-04-01 00Z'), end: moment('2010-04-30 00Z') }, 'DD-MM-YYYY'),
    new TimePeriod({ start: moment('2010-03-01 00Z'), end: moment('2010-03-31 00Z') }, 'DD-MM-YYYY'),
  ];

  var streamsData = [
    [
      { testMetricA: 10, testMetricB: 'abc' },
      { testMetricA: 20, testMetricB: 'xyz' },
    ],
    [
      { testMetricA: 40, testMetricB: 'abc' },
      { testMetricA: 50, testMetricB: 'xyz' }
    ],
    [
      { testMetricA: 30, testMetricB: 'abc' },
      { testMetricA: 30, testMetricB: 'xyz' },
    ]
  ];

  var streamTestData = function() {
    _.each(testAnalysisStreams, function(s, index) {
      _.each(streamsData[index], function(v) {
        s.push(v);
      });
      s.end();
    });
  };

  beforeEach(function() {
    testAnalysisStreams = [
      new stream.PassThrough({ objectMode: true }),
      new stream.PassThrough({ objectMode: true }),
      new stream.PassThrough({ objectMode: true })
    ];

    mockFilesHelper = jasmine.createSpyObj('filesHelper', ['vcsNormalisedLog', 'layerGrouping']);
    mockCodeMaatHelper = {
      testAnalysis: jasmine.createSpy('testAnalysis')
    };
    var spyStrategy = mockCodeMaatHelper.testAnalysis.and;
    spyStrategy.returnValues.apply(spyStrategy, testAnalysisStreams);
  });

  describe('with empty layer group', function() {
    beforeEach(function() {
      var context = { timePeriods: timePeriods, layerGrouping: new LayerGrouping({}) };
      subject = new DataCollector(context, mockFilesHelper, mockCodeMaatHelper);
    });

    describe('with no cumulative results', function() {
      it('returns the aggregation of all time periods analysis results', function(done) {
        var analysis = {
          codeMaatAnalysis: 'testAnalysis',
          metricCollector: function(obj) { return { metric: obj.testMetricA }; },
          initialValue: { metric: 0 }
        };
        var data = [];
        subject.reportStream(analysis)
          .on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              jasmine.objectContaining({ metric: 30, date: '2010-05-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 90, date: '2010-04-30T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 60, date: '2010-03-31T00:00:00.000Z' }),
            ]);
            done();
          });

        streamTestData();
      });
    });

    describe('with cumulative results', function() {
      it('returns the aggregation of all time periods analysis results sorted by time', function(done) {
        var analysis = {
          codeMaatAnalysis: 'testAnalysis',
          metricCollector: function(obj) { return { metric: obj.testMetricA }; },
          initialValue: { metric: 0 },
          accumulators: {
            cumulativeMetric: _.property('metric')
          }
        };
        var data = [];
        subject.reportStream(analysis)
          .on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              jasmine.objectContaining({ metric: 60, cumulativeMetric:  60, date: '2010-03-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 90, cumulativeMetric: 150, date: '2010-04-30T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 30, cumulativeMetric: 180, date: '2010-05-31T00:00:00.000Z' }),
            ]);
            done();
          });

        streamTestData();
      });
    });
  });

  describe('with a layer group', function() {
    beforeEach(function() {
      var context = { timePeriods: timePeriods, layerGrouping: new LayerGrouping({ testLayer1: 'layer1', testLayer2: 'layer2' }) };
      subject = new DataCollector(context, mockFilesHelper, mockCodeMaatHelper);
    });

    describe('with no cumulative results', function() {
      it('returns the map of all time periods analysis results', function(done) {
        var analysis = {
          codeMaatAnalysis: 'testAnalysis',
          metricCollector: function(obj) { return { metric: obj.testMetricA }; }
        };
        var data = [];
        subject.reportStream(analysis)
          .on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              jasmine.objectContaining({ metric: 10, date: '2010-05-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 20, date: '2010-05-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 40, date: '2010-04-30T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 50, date: '2010-04-30T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 30, date: '2010-03-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 30, date: '2010-03-31T00:00:00.000Z' }),
            ]);
            done();
          });

        streamTestData();
      });
    });

    describe('with cumulative results', function() {
      it('returns the map of all time periods analysis results', function(done) {
        var analysis = {
          codeMaatAnalysis: 'testAnalysis',
          metricCollector: function(obj) { return { metric: obj.testMetricA }; },
          accumulators: {
            cumulativeMetric: _.property('metric')
          }
        };
        var data = [];
        subject.reportStream(analysis)
          .on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              jasmine.objectContaining({ metric: 30, cumulativeMetric:  30, date: '2010-03-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 30, cumulativeMetric:  60, date: '2010-03-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 40, cumulativeMetric: 100, date: '2010-04-30T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 50, cumulativeMetric: 150, date: '2010-04-30T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 10, cumulativeMetric: 160, date: '2010-05-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 20, cumulativeMetric: 180, date: '2010-05-31T00:00:00.000Z' }),
            ]);
            done();
          });

        streamTestData();
      });
    });
  });
});
