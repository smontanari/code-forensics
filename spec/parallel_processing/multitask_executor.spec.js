var stream = require('stream'),
    Q      = require('q');

var utils             = require_src('utils'),
    MultiTaskExecutor = require_src('parallel_processing/multitask_executor');

describe('MultiTaskExecutor', function() {
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
        expect(data[0].state).toEqual('fulfilled');
        expect(data[1].state).toEqual('fulfilled');
        expect(data[0].value).toEqual(123);
        expect(data[1].value).toEqual('abc');
        done();
      });
    });

    it('completes with a job failure when a function fails', function(done) {
      this.subject.processAll([
        function() { return function() { throw 'something is wrong'; }; },
        function() { return 'abc'; }
      ]).then(function(data) {
        expect(data[0].state).toEqual('rejected');
        expect(data[1].state).toEqual('fulfilled');
        expect(data[0].reason).toEqual('something is wrong');
        expect(data[1].value).toEqual('abc');
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
        expect(data[0].state).toEqual('fulfilled');
        expect(data[1].state).toEqual('fulfilled');
        expect(data[0].value).toEqual(123);
        expect(data[1].value).toEqual('abc');
        done();
      });
    });

    it('completes with a job failure when the factory function fails', function(done) {
      this.subject.processAll([
        function() { throw 'cannot return a value'; },
        function() { return 'abc'; }
      ]).then(function(data) {
        expect(data[0].state).toEqual('rejected');
        expect(data[1].state).toEqual('fulfilled');
        expect(data[0].reason).toEqual('cannot return a value');
        expect(data[1].value).toEqual('abc');
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
        expect(data[0].state).toEqual('fulfilled');
        expect(data[1].state).toEqual('fulfilled');
        expect(data[0].value).toEqual('test-stream1');
        expect(data[1].value).toEqual('test-stream2');
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
        expect(data[0].state).toEqual('fulfilled');
        expect(data[1].state).toEqual('rejected');
        expect(data[0].value).toEqual('test-stream1');
        expect(data[1].reason).toEqual('test stream2 error');
        done();
      });
    });
  });
});
