/*global require_src*/
var _      = require('lodash'),
    stream = require('stream');

var MultiTaskExecutor = require_src('parallel_processing/multitask_executor');

describe('MultiTaskExecutor', function() {
  var assertSettledPromises = function(data, expectedPromises) {
    expect(data.length).toEqual(expectedPromises.length);
    _.each(expectedPromises, function(promise, index) {
      if (promise.fulfilled) {
        expect(data[index].isFulfilled()).toEqual(true);
        expect(data[index].value()).toEqual(promise.value);
      } else {
        expect(data[index].isRejected()).toEqual(true);
        expect(data[index].reason().message).toEqual(promise.reason);
      }
    });
  };

  describe('when processing simple functions or simple values', function() {
    beforeEach(function() {
      this.subject = new MultiTaskExecutor({
        addJob: function(fn) { setTimeout(fn, 100); }
      });
    });

    it('completes returning the success/failure of every job', function(done) {
      this.subject.processAll([
        function() { return function() { throw new Error('something is wrong'); }; },
        function() { return 'abc'; }
      ]).then(function(data) {
        assertSettledPromises(data, [
          { fulfilled: false, reason: 'something is wrong' },
          { fulfilled: true, value: 'abc' }
        ]);
        done();
      });
    });
  });

  describe('when processing promises or functions returning promises', function() {
    beforeEach(function() {
      this.subject = new MultiTaskExecutor({
        addJob: function(fn) { setTimeout(fn, 100); }
      });
    });

    it('completes returning the success/failure of every job', function(done) {
      this.subject.processAll([
        function() { throw new Error('cannot return a value'); },
        function() { return 'abc'; }
      ]).then(function(data) {
        assertSettledPromises(data, [
          { fulfilled: false, reason: 'cannot return a value' },
          { fulfilled: true, value: 'abc' }
        ]);
        done();
      });
    });
  });

  describe('when processing streams', function() {
    describe('without capturing the streams output', function() {
      beforeEach(function() {
        this.subject = new MultiTaskExecutor({
          addJob: function(fn) { setTimeout(fn, 100); }
        });
      });

      it('completes returning the success/failure of every job', function(done) {
        var s1 = new stream.PassThrough();
        var s2 = new stream.PassThrough();
        this.subject.processAll([
          function() { return s1; },
          function() { return s2; }
        ]).then(function(data) {
          assertSettledPromises(data, [
            { fulfilled: true },
            { fulfilled: false, reason: 'test stream2 error' }
          ]);
          done();
        });

        _.delay(function() {
          s1.push('123');
          s1.push('456');
          s2.push('qwe');
          s2.push('asd');
          s1.end();
          s2.emit('error', new Error('test stream2 error'));
        }, 250);
      });
    });

    describe('capturing the streams output', function() {
      beforeEach(function() {
        this.subject = new MultiTaskExecutor({
          addJob: function(fn) { setTimeout(fn, 100); }
        }, { captureStreamResults: true });
      });

      it('completes returning the success/failure of every job', function(done) {
        var s1 = new stream.PassThrough({ objectMode: true });
        var s2 = new stream.PassThrough();
        this.subject.processAll([
          function() { return s1; },
          function() { return s2; }
        ]).then(function(data) {
          assertSettledPromises(data, [
            { fulfilled: true, value: [123, 456] },
            { fulfilled: false, reason: 'test stream2 error' }
          ]);
          done();
        });

        _.delay(function() {
          s1.push(123);
          s1.push(456);
          s2.push('qwe');
          s2.push('asd');
          s1.end();
          s2.emit('error', new Error('test stream2 error'));
        }, 250);
      });
    });
  });
});
