var _      = require('lodash'),
    stream = require('stream'),
    Q      = require('q');

var utils             = require_src('utils'),
    MultiTaskExecutor = require_src('parallel_processing/multitask_executor');

describe('MultiTaskExecutor', function() {
  var assertSettledPromises = function(data, expectedPromises) {
    expect(data.length).toEqual(expectedPromises.length);
    _.each(expectedPromises, function(promise, index) {
      expect(data[index].state).toEqual(promise.state);
      expect(data[index].value).toEqual(promise.value);
      expect(data[index].reason).toEqual(promise.reason);
    });
  };

  beforeEach(function() {
    this.subject = new MultiTaskExecutor({
      addJob: function(fn) { setTimeout(fn, 100); }
    });
  });

  describe('when processing simple functions or simple values', function() {
    it('completes successfully and returns the values of every job', function(done) {
      this.subject.processAll([
        function() { return function() { return 123; }; },
        function() { return 'abc'; }
      ]).then(function(data) {
        assertSettledPromises(data, [
          { state: 'fulfilled', value: 123 },
          { state: 'fulfilled', value: 'abc' }
        ]);
        done();
      });
    });

    it('completes with a job failure when a function fails', function(done) {
      this.subject.processAll([
        function() { return function() { throw 'something is wrong'; }; },
        function() { return 'abc'; }
      ]).then(function(data) {
        assertSettledPromises(data, [
          { state: 'rejected', reason: 'something is wrong' },
          { state: 'fulfilled', value: 'abc' }
        ]);
        done();
      });
    });
  });

  describe('when processing promises or functions returning promises', function() {
    it('completes successfully and returns the values of every job', function(done) {
      this.subject.processAll([
        function() { return function() { return Q(123); }; },
        function() { return Q('abc'); }
      ]).then(function(data) {
        assertSettledPromises(data, [
          { state: 'fulfilled', value: 123 },
          { state: 'fulfilled', value: 'abc' }
        ]);
        done();
      });
    });

    it('completes with a job failure when the factory function fails', function(done) {
      this.subject.processAll([
        function() { throw 'cannot return a value'; },
        function() { return 'abc'; }
      ]).then(function(data) {
        assertSettledPromises(data, [
          { state: 'rejected', reason: 'cannot return a value' },
          { state: 'fulfilled', value: 'abc' }
        ]);
        done();
      });
    });
  });

  describe('when processing streams', function() {
    it('completes successfully and returns the values of every job', function(done) {
      spyOn(utils.stream, 'streamToPromise').and.returnValues(Q('test-stream1'), Q('test-stream2'));
      var s1 = new stream.Readable();
      var s2 = new stream.Readable();
      this.subject.processAll([
        function() { return s1; },
        function() { return s2; }
      ]).then(function(data) {
        assertSettledPromises(data, [
          { state: 'fulfilled', value: 'test-stream1' },
          { state: 'fulfilled', value: 'test-stream2' }
        ]);
        done();
      });
    });

    it('completes with a job failure when a stream fails', function(done) {
      spyOn(utils.stream, 'streamToPromise').and.returnValues(Q('test-stream1'), Q.reject('test stream2 error'));
      var s1 = new stream.Readable();
      var s2 = new stream.Readable();
      this.subject.processAll([
        function() { return s1; },
        function() { return s2; }
      ]).then(function(data) {
        assertSettledPromises(data, [
          { state: 'fulfilled', value: 'test-stream1' },
          { state: 'rejected', reason: 'test stream2 error' }
        ]);
        done();
      });
    });
  });
});
