/*global require_src*/
var _      = require('lodash'),
    stream = require('stream');

var DataCollector = require_src('tasks/system_analysis/data_collector');

describe('DataCollector', function() {
  var subject, mockAnalysis, testAnalysisStreams;

  var timePeriods = ['p1', 'p2', 'p3', 'p4', 'p5'];

  var streamsData = [
    { metric: 30, date: '2010-05-31T00:00:00.000Z' },
    { metric: 90, date: '2010-04-30T00:00:00.000Z' },
    { date: 'x' },
    { metric: 60, date: '2010-03-31T00:00:00.000Z' },
    { metric: 20 }
  ];

  var streamTestData = function() {
    _.each(testAnalysisStreams, function(s, index) {
      s.push(streamsData[index]);
      s.end();
    });
  };

  beforeEach(function() {
    testAnalysisStreams = _.times(5, function() {
      return new stream.PassThrough({ objectMode: true });
    });

    mockAnalysis = {
      isSupported: jasmine.createSpy('analysis.isSupported'),
      collect: jasmine.createSpy('analysis.collect'),
      accumulator: new stream.PassThrough({ objectMode: true })
    };
    mockAnalysis.collect.and.returnValues.apply(mockAnalysis.collect.and, testAnalysisStreams);
  });

  describe('when analysis is not supported', function() {
    beforeEach(function() {
      mockAnalysis.isSupported.and.returnValue(false);
      subject = new DataCollector(timePeriods);
    });

    it('returns a rejected promise', function(done) {
      subject.collectDataStream(mockAnalysis).catch(done);
    });
  });

  describe('when analysis is supported', function() {
    beforeEach(function() {
      mockAnalysis.isSupported.and.returnValue(true);
      subject = new DataCollector(timePeriods);
    });

    it('returns a promise with the stream of all time periods analysis results, sorted', function(done) {
      subject.collectDataStream(mockAnalysis)
        .then(function(stream) {
          var data = [];
          stream.on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              jasmine.objectContaining({ metric: 60, date: '2010-03-31T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 90, date: '2010-04-30T00:00:00.000Z' }),
              jasmine.objectContaining({ metric: 30, date: '2010-05-31T00:00:00.000Z' }),
            ]);
            done();
          });
        });

      streamTestData();
    });
  });
});
