var fs     = require('fs')
    _      = require('lodash'),
    stream = require('stream');

var streamUtils = require_src('utils').stream;

describe('utils', function() {
  describe('stream', function() {
    describe('.parseFileToObjectStream()', function() {
      beforeEach(function() {
        spyOn(fs, 'readFile').and.callFake(function(file, callback) {
          _.delay(function() { callback(null, 'test-file-content'); }, 100);
        });
      });

      describe('when the parsed content is an object', function() {
        it('streams the object through', function(done) {
          streamUtils.parseFileToObjectStream('test/file', function(data) {
            return { obj: data };
          })
          .on('data', function(obj) {
            expect(obj).toEqual({ obj: 'test-file-content' });
          })
          .once('end', done);
        });
      });

      describe('when the parsed content is not an object', function() {
        it('returns an empty stream', function(done) {
          var data = null;
          streamUtils.parseFileToObjectStream('test/file', function() {})
          .on('data', function(obj) { data = obj; })
          .once('end', function() {
            expect(data).toBeNull();
            done();
          });
        });
      });
    });

    describe('.reduceToObjectStream()', function() {
      describe('when the parsed stream is an object', function() {
        it('streams through the object', function(done) {
          var input = new stream.PassThrough();

          input.pipe(streamUtils.reduceToObjectStream(function(data) {
            return { obj: data.toString() };
          }))
          .on('data', function(obj) {
            expect(obj).toEqual({ obj: 'test-stream-content' });
          })
          .once('end', done);

          _.each(['test-', 'stream-', 'content'], function(s) {
            input.write(s);
          });
          input.end();
        });
      });

      describe('when the parsed stream is not an object', function() {
        it('returns an empty stream', function(done) {
          var data = null;
          var input = new stream.PassThrough();
          input.pipe(streamUtils.reduceToObjectStream(function() {}))
          .on('data', function(obj) { data = obj; })
          .once('end', function() {
            expect(data).toBeNull();
            done();
          });

          input.write("test");
          input.end();
        });
      });
    });

    describe('.streamToPromise()', function() {
      describe('with a readable stream', function() {
        it('returns a promise that completes when the stream ends', function(done) {
          var completed = false;
          var readable = new stream.PassThrough();
          readable.on('end', function() { completed = true; });

          streamUtils.streamToPromise(readable).then(function() {
            expect(completed).toBe(true);
            done();
          });

          readable.resume();
          readable.push('something');
          readable.push(null);
        });
      });

      describe('with a writable stream', function() {
        it('returns a promise that completes when the stream finishes', function(done) {
          var completed = false;
          var writable = new stream.PassThrough();
          writable.on('finish', function() { completed = true; });

          streamUtils.streamToPromise(writable).then(function() {
            expect(completed).toBe(true);
            done();
          });

          writable.write('something');
          writable.end();
        });
      });
    });
  });
});
