/*global require_src*/
var _ =      require('lodash'),
    stream = require('stream'),
    moment = require('moment');

var TimePeriodResults = require_src('tasks/system_analysis/time_period_results'),
    TimePeriod        = require_src('models/time_interval/time_period');

describe('TimePeriodResults', function() {
  describe('resultsMapper', function() {
    beforeEach(function () {
      this.subject = TimePeriodResults.resultsMapper(
        function (obj) {
          return {
            result1: obj.metricA,
            result2: obj.metricA * obj.metricB
          };
        });
    });

    it('returns a function that maps a stream of results', function(done) {
      var objStream = new stream.PassThrough({ objectMode: true });

      var streamMap = this.subject.call(null, new TimePeriod({
        start: moment('2010-01-08 09:30:00.000'),
        end: moment('2010-06-08 09:30:00.000')
      }, 'DD-MM-YYYY'));

      var allObjs = [];
      objStream.pipe(streamMap)
        .on('data', function (obj) {
          allObjs.push(obj);
        })
        .once('end', function () {
          expect(allObjs).toEqual([
            { name: 'path1', date: '2010-06-07T23:30:00.000Z', result1: 10, result2: 20 },
            { name: 'path2', date: '2010-06-07T23:30:00.000Z', result1: 20, result2: 60 }
          ]);
          done();
        });

      objStream.push({ path: 'path1', metricA: 10, metricB: 2, metric3: 5 });
      objStream.push({ path: 'path2', metricA: 20, metricB: 3, metric3: 5 });
      objStream.end();
    });
  });

  describe('resultsReducer', function() {
    beforeEach(function () {
      this.subject = TimePeriodResults.resultsReducer(
        function (obj) {
          return {
            result1: obj.metricA,
            result2: obj.metricA * obj.metricB
          };
        },
        { result1: 0, result2: 0 }
      );
    });

    it('returns a function that reduces a stream of results', function(done) {
      var objStream = new stream.PassThrough({ objectMode: true });

      var streamMap = this.subject.call(null, new TimePeriod({
        start: moment('2010-01-08 09:30:00.000'),
        end: moment('2010-06-08 09:30:00.000')
      }, 'DD-MM-YYYY'), { result1: 0, result2: 0 });

      objStream.pipe(streamMap)
        .on('data', function (obj) {
          expect(obj).toEqual(
            { name: 'All files', date: '2010-06-07T23:30:00.000Z', result1: 30, result2: 80 }
          );
        })
        .once('end', done);

      objStream.push({ path: 'path1', metricA: 10, metricB: 2, metric3: 5 });
      objStream.push({ path: 'path2', metricA: 20, metricB: 3, metric3: 5 });
      objStream.end();
    });
  });

  describe('resultsAccumulator', function() {
    beforeEach(function () {
      this.subject = TimePeriodResults.resultsAccumulator(
        {
          cumulativeResult1: _.property('metricA'),
          cumulativeResult2: function(obj) { return obj.metricA * obj.metricB; }
        }
      );
    });

    it('returns a function that maps a stream of results with cumulative properties', function (done) {
      var objStream = new stream.PassThrough({ objectMode: true });

      var allObjs = [];
      objStream.pipe(this.subject)
        .on('data', function (obj) {
          allObjs.push(obj);
        })
        .once('end', function () {
          expect(allObjs).toEqual([
            { name: 'path1', cumulativeResult1:  1, cumulativeResult2:  2, metricA: 1, metricB: 2, metric3: 5 },
            { name: 'path2', cumulativeResult1:  2, cumulativeResult2:  6, metricA: 2, metricB: 3, metric3: 5 },
            { name: 'path2', cumulativeResult1:  9, cumulativeResult2: 20, metricA: 7, metricB: 2, metric3: 5 },
            { name: 'path1', cumulativeResult1:  4, cumulativeResult2: 17, metricA: 3, metricB: 5, metric3: 5 },
            { name: 'path2', cumulativeResult1: 13, cumulativeResult2: 28, metricA: 4, metricB: 2, metric3: 5 },
          ]);
          done();
        });

      objStream.push({ name: 'path1', metricA: 1, metricB: 2, metric3: 5 });
      objStream.push({ name: 'path2', metricA: 2, metricB: 3, metric3: 5 });
      objStream.push({ name: 'path2', metricA: 7, metricB: 2, metric3: 5 });
      objStream.push({ name: 'path1', metricA: 3, metricB: 5, metric3: 5 });
      objStream.push({ name: 'path2', metricA: 4, metricB: 2, metric3: 5 });
      objStream.end();
    });
  });
});
