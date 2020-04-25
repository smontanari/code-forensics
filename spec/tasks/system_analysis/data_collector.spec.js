var stream   = require('stream'),
    Bluebird = require('bluebird');

var DataCollector = require('tasks/system_analysis/data_collector');

describe('DataCollector', function() {
  var subject, mockAnalysis, testAnalysisStream;

  var timePeriods = 'time-periods';

  var streamsData = [
    { metric: 30, date: '2010-05-31T00:00:00.000Z' },
    { metric: 90, date: '2010-04-30T00:00:00.000Z' },
    { date: 'x' },
    { metric: 60, date: '2010-03-31T00:00:00.000Z' },
    { metric: 20 }
  ];

  beforeEach(function() {
    testAnalysisStream = new stream.PassThrough({ objectMode: true });

    mockAnalysis = {
      isSupported: jest.fn().mockName('analysis.isSupported'),
      collect: jest.fn().mockName('analysis.collect'),
      accumulator: new stream.PassThrough({ objectMode: true })
    };
    mockAnalysis.collect.mockReturnValue(testAnalysisStream);
  });

  describe('when analysis is not supported', function() {
    beforeEach(function() {
      mockAnalysis.isSupported.mockReturnValue(false);
      subject = new DataCollector(timePeriods);
    });

    it('returns a rejected promise', function() {
      return expect(subject.collectDataStream(mockAnalysis))
        .rejects.toEqual('Data analysis not supported');
    });
  });

  describe('when analysis is supported', function() {
    beforeEach(function() {
      mockAnalysis.isSupported.mockReturnValue(true);
      subject = new DataCollector(timePeriods);
    });

    it('returns a promise with the stream of all time periods analysis results, sorted', function() {
      return new Bluebird(function(done) {
        subject.collectDataStream(mockAnalysis)
          .then(function(stream) {
            var data = [];
            stream.on('data', function(obj) { data.push(obj); })
            .on('end', function() {
              expect(data).toEqual([
                expect.objectContaining({ metric: 60, date: '2010-03-31T00:00:00.000Z' }),
                expect.objectContaining({ metric: 90, date: '2010-04-30T00:00:00.000Z' }),
                expect.objectContaining({ metric: 30, date: '2010-05-31T00:00:00.000Z' })
              ]);
              done();
            });
          })
          .catch(done.fail);

        streamsData.forEach(function(data) {
          testAnalysisStream.push(data);
        });
        testAnalysisStream.end();
      });
    });
  });
});
