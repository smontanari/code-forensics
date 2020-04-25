var _      = require('lodash'),
  stream   = require('stream'),
  Bluebird = require('bluebird');

var StreamProcessor = require('parallel_processing/stream_processor');

describe('StreamProcessor', function() {
  var subject;
  var jobScheduler = {
    addJob: function(fn) {
      return Bluebird.try(fn);
    }
  };

  beforeEach(function() {
    subject = new StreamProcessor(jobScheduler);
  });

  describe('merge a list of generated streams', function() {
    it('completes returning the merged stream', function() {
      return new Bluebird(function(done) {
        var streamsData = [
          ['abc', 'xyz'],
          [123, 456, 789],
          [{ p1: 'qwe', p2: 'zxc' }, { p: 'ASD' }]
        ];
        var streams = new Array(3);

        var outputStream = subject.mergeAll(streamsData, function(data) {
          return _.tap(new stream.PassThrough({ objectMode: true }), function(s) {
            streams.push(s);
            _.delay(function() {
              data.forEach(function(item) { s.push(item); });
              s.end();
            }, 100);
          });
        });

        var data = [];
        outputStream
          .on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              'abc', 'xyz', 123, 456, 789,
              { p1: 'qwe', p2: 'zxc' },
              { p: 'ASD' }
            ]);
            done();
          });
      });
    });

    it('skips any failed stream', function() {
      return new Bluebird(function(done) {
        var streamsData = [
          ['abc', 'xyz'],
          [123, null],
          [{ p1: 'qwe', p2: 'zxc' }, { p: 'ASD' }]
        ];
        var streams = new Array(3);

        var outputStream = subject.mergeAll(streamsData, function(data) {
          return _.tap(new stream.PassThrough({ objectMode: true }), function(s) {
            streams.push(s);
            _.delay(function() {
              data.forEach(function(item) {
                if (item) {
                  s.push(item);
                } else {
                  s.emit('error', new Error('test stream error'));
                }
              });
              s.end();
            }, 100);
          });
        });

        var data = [];
        outputStream
          .on('data', function(obj) { data.push(obj); })
          .on('end', function() {
            expect(data).toEqual([
              'abc', 'xyz', 123,
              { p1: 'qwe', p2: 'zxc' },
              { p: 'ASD' }
            ]);
            done();
          });
        });
    });
  });

  describe('process a list of generated streams', function() {
    it('completes returning the success/failure of every processed stream', function() {
      return new Bluebird(function(done) {
        var streams = _.times(3, function() { return new stream.PassThrough(); });

        subject.processAll([0, 1, 2], function(index) { return streams[index]; })
          .then(function(data) {
            expect(data).toHaveLength(3);
            expect(data[0].isFulfilled()).toBe(true);
            expect(data[1].isRejected()).toBe(true);
            expect(data[1].reason().message).toEqual('test stream error');
            expect(data[2].isFulfilled()).toBe(true);
            done();
          })
          .catch(done.fail);

        _.delay(function() {
          streams[0].push('123');
          streams[0].push('456');
          streams[1].push('qwe');
          streams[1].push('asd');
          streams[2].push('abc');
          streams[2].push('xyz');
          streams[0].end();
          streams[1].emit('error', new Error('test stream error'));
          streams[2].end();
        }, 100);
      });
    });
  });

  describe('process a single generated stream', function() {
    it('completes successfully the processing of the stream', function() {
      return new Bluebird(function(done) {
        var s = stream.PassThrough({ objectMode: true });

        subject.process(function() { return s; })
          .then(function(result) {
            expect(result.isFulfilled()).toBe(true);
            done();
          })
          .catch(done.fail);

        _.delay(function() {
          s.push({ a: '123', b: '456' });
          s.push({ a: 'abc', b: 'xyz' });
          s.end();
        }, 50);
      });
    });

    it('fails the processing of the stream', function() {
      return new Bluebird(function(done) {
        var s = stream.PassThrough({ objectMode: true });

        subject.process(function() { return s; })
          .then(function(result) {
            expect(result.isRejected()).toBe(true);
            expect(result.reason().message).toEqual('stream failure');
            done();
          })
          .catch(done.fail);

        _.delay(function() {
          s.push({ a: '123', b: '456' });
          s.emit('error', new Error('stream failure'));
        }, 50);
      });
    });
  });

  describe('read a single generated stream', function() {
    it('reads the content of the stream', function() {
      return new Bluebird(function(done) {
        var s = stream.PassThrough({ objectMode: true });

        subject.read(function() { return s; })
          .then(function(data) {
            expect(data).toEqual([
              { a: '123', b: '456' },
              { a: 'abc', b: 'xyz' }
            ]);
            done();
          })
          .catch(done.fail);

        _.delay(function() {
          s.push({ a: '123', b: '456' });
          s.push({ a: 'abc', b: 'xyz' });
          s.end();
        }, 50);
      });
    });
  });
});
