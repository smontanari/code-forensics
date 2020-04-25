/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "assertSettledPromises"] }] */
var Bluebird = require('bluebird');

var TaskExecutor = require('parallel_processing/task_executor');

describe('TaskExecutor', function() {
  var subject;
  var jobScheduler = {
    addJob: function(fn) { return Bluebird.try(fn); }
  };

  var assertSettledPromises = function(data, expectedPromises) {
    expect(data).toHaveLength(expectedPromises.length);
    expectedPromises.forEach(function(promise, index) {
      if (promise.fulfilled) {
        expect(data[index].isFulfilled()).toEqual(true);
        expect(data[index].value()).toEqual(promise.value);
      } else {
        expect(data[index].isRejected()).toEqual(true);
        expect(data[index].reason().message).toEqual(promise.reason);
      }
    });
  };

  beforeEach(function() {
    subject = new TaskExecutor(jobScheduler);
  });

  describe('run a list of functions', function() {
    it('completes returning the success/failure of every job', function() {
      return subject.runAll([
        function() { return 'abc'; },
        function() { throw new Error('something is wrong'); },
        function() { return function() { throw new Error('cannot return a value'); }; },
        function() { return Bluebird.resolve(123); }
      ]).then(function(data) {
          assertSettledPromises(data, [
            { fulfilled: true, value: 'abc' },
            { fulfilled: false, reason: 'something is wrong' },
            { fulfilled: false, reason: 'cannot return a value' },
            { fulfilled: true, value: 123 }
          ]);
        });
    });
  });

  describe('map and run an iterable', function() {
    it('completes returning the success/failure of every job', function() {
      return subject.runAll([
        function() { return 'abc'; },
        function() { throw new Error('something is wrong'); },
        function() { return function() { throw new Error('cannot return a value'); }; },
        function() { return Bluebird.resolve(123); }
      ], function(fn) { return fn(); })
        .then(function(data) {
          assertSettledPromises(data, [
            { fulfilled: true, value: 'abc' },
            { fulfilled: false, reason: 'something is wrong' },
            { fulfilled: false, reason: 'cannot return a value' },
            { fulfilled: true, value: 123 }
          ]);
        });
    });
  });
});
