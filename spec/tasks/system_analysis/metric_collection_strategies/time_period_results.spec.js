var _        = require('lodash'),
    stream   = require('stream'),
    Bluebird = require('bluebird'),
    moment   = require('moment');

var TimePeriodResults = require('tasks/system_analysis/metric_collection_strategies/time_period_results'),
    TimePeriod        = require('models/time_interval/time_period');

describe('TimePeriodResults', function() {
  var subject;
  describe('resultsMapper', function() {
    beforeEach(function() {
      subject = TimePeriodResults.resultsMapper(
        function(obj) {
          return {
            result1: obj.metricA,
            result2: obj.metricA * obj.metricB
          };
        });
    });

    it('returns a function that maps a stream of results', function() {
      return new Bluebird(function(done) {
        var objStream = new stream.PassThrough({ objectMode: true });

        var streamMap = subject.call(null, new TimePeriod({
          start: moment('2010-01-08 09:30:00.000'),
          end: moment('2010-06-08 09:30:00.000')
        }, 'DD-MM-YYYY'));

        var allObjs = [];
        objStream.pipe(streamMap)
          .on('data', function(obj) {
            allObjs.push(obj);
          })
          .once('end', function() {
            expect(allObjs).toEqual([
              { name: 'path1', date: '2010-06-08T09:30:00.000Z', result1: 10, result2: 20 },
              { name: 'path2', date: '2010-06-08T09:30:00.000Z', result1: 20, result2: 60 }
            ]);
            done();
          });

        objStream.push({ path: 'path1', metricA: 10, metricB: 2, metricC: 5 });
        objStream.push({ path: 'path2', metricA: 20, metricB: 3, metricC: 5 });
        objStream.end();
      });
    });
  });

  describe('resultsMerger', function() {
    beforeEach(function() {
      subject = TimePeriodResults.resultsMerger(
        function(obj) {
          return {
            result1: obj.metricA,
            result2: obj.metricC * 2
          };
        });
    });

    it('returns a function that merges a stream of results', function() {
      return new Bluebird(function(done) {
        var objStream = new stream.PassThrough({ objectMode: true });

        var streamMap = subject.call(null, new TimePeriod({
          start: moment('2010-01-08 09:30:00.000'),
          end: moment('2010-06-08 09:30:00.000')
        }, 'DD-MM-YYYY'));

        objStream.pipe(streamMap)
          .on('data', function(obj) {
            expect(obj).toEqual(
              { name: 'path', date: '2010-06-08T09:30:00.000Z', result1: 10, result2: 10 }
            );
          })
          .once('end', done);

        objStream.push({ path: 'path', metricA: 10 });
        objStream.push({ path: 'path', metricB: 2 });
        objStream.push({ path: 'path', metricC: 5 });
        objStream.end();
      });
    });
  });

  describe('resultsReducer', function() {
    beforeEach(function() {
      subject = TimePeriodResults.resultsReducer(
        function(obj) {
          return {
            result1: obj.metricA,
            result2: obj.metricA * obj.metricB
          };
        },
        { result1: 0, result2: 0 }
      );
    });

    it('returns a function that reduces a stream of results', function() {
      return new Bluebird(function(done) {
        var objStream = new stream.PassThrough({ objectMode: true });

        var streamMap = subject.call(null, new TimePeriod({
          start: moment('2010-01-08 09:30:00.000'),
          end: moment('2010-06-08 09:30:00.000')
        }, 'DD-MM-YYYY'), { result1: 0, result2: 0 });

        objStream.pipe(streamMap)
          .on('data', function(obj) {
            expect(obj).toEqual(
              { name: 'All files', date: '2010-06-08T09:30:00.000Z', result1: 30, result2: 80 }
            );
          })
          .once('end', done);

        objStream.push({ path: 'path1', metricA: 10, metricB: 2, metricC: 5 });
        objStream.push({ path: 'path2', metricA: 20, metricB: 3, metricC: 5 });
        objStream.end();
      });
    });
  });

  describe('resultsAccumulator', function() {
    describe('with an accumulators map', function() {
      beforeEach(function() {
        subject = TimePeriodResults.resultsAccumulator(
          {
            cumulativeResult1: _.property('metricA'),
            cumulativeResult2: function(obj) {
              return (obj.metricA || 0) * (obj.metricB || 0);
            }
          }
        );
      });

      it('returns a function that maps a stream of results with cumulative properties', function() {
        return new Bluebird(function(done) {
          var objStream = new stream.PassThrough({ objectMode: true });

          var allObjs = [];
          objStream.pipe(subject)
            .on('data', function(obj) {
              allObjs.push(obj);
            })
            .once('end', function() {
              expect(allObjs).toEqual([
                { name: 'path1', cumulativeResult1:  1, cumulativeResult2:  2, metricA: 1, metricB: 2, metricC: 5 },
                { name: 'path2', cumulativeResult1:  2, cumulativeResult2:  6, metricA: 2, metricB: 3, metricC: 5 },
                { name: 'path2', cumulativeResult1:  9, cumulativeResult2: 20, metricA: 7, metricB: 2, metricC: 5 },
                { name: 'path1', cumulativeResult1:  4, cumulativeResult2: 17, metricA: 3, metricB: 5, metricC: 5 },
                { name: 'path2', cumulativeResult1: 13, cumulativeResult2: 28, metricA: 4, metricB: 2, metricC: 5 }
              ]);
              done();
            });

          objStream.push({ name: 'path1', metricA: 1, metricB: 2, metricC: 5 });
          objStream.push({ name: 'path2', metricA: 2, metricB: 3, metricC: 5 });
          objStream.push({ name: 'path2', metricA: 7, metricB: 2, metricC: 5 });
          objStream.push({ name: 'path1', metricA: 3, metricB: 5, metricC: 5 });
          objStream.push({ name: 'path2', metricA: 4, metricB: 2, metricC: 5 });
          objStream.end();
        });
      });
    });

    describe('with no accumulators map', function() {
      beforeEach(function() {
        subject = TimePeriodResults.resultsAccumulator();
      });

      it('returns a function that maps the same stream of results', function() {
        return new Bluebird(function(done) {
          var objStream = new stream.PassThrough({ objectMode: true });

          var inputItems = [
            { name: 'path1', metricA: 1, metricB: 2, metricC: 5 },
            { name: 'path2', metricA: 2, metricB: 3, metricC: 5 },
            { name: 'path2', metricA: 7, metricB: 2, metricC: 5 },
            { name: 'path1', metricA: 3, metricB: 5, metricC: 5 },
            { name: 'path2', metricA: 4, metricB: 2, metricC: 5 }
          ];

          var allObjs = [];
          objStream.pipe(subject)
            .on('data', function(obj) {
              allObjs.push(obj);
            })
            .once('end', function() {
              expect(allObjs).toEqual(inputItems);
              done();
            });

          inputItems.forEach(objStream.push.bind(objStream));
          objStream.end();
        });
      });
    });
  });
});
