var _           = require('lodash'),
    fs          = require('fs'),
    Q           = require('q'),
    isStream    = require('is-stream'),
    through2    = require('through2'),
    PassThrough = require('stream').PassThrough;

var STREAM_EVENT_MAP = {
  end: function(s) { return isStream.readable(s); },
  finish: function(s) { return isStream.writable(s); }
};

module.exports = {
  readFileToObjectStream: function(filepath, transformFn) {
    return _.tap(new PassThrough({objectMode: true}), function(outStream) {
      fs.readFile(filepath, function(err, data) {
        if (err) {
          outStream.emit('error', err);
        } else {
          var outputObject = transformFn(data);
          if (_.isObject(outputObject)) { outStream.write(outputObject); }
          outStream.end();
        }
      });
    });
  },
  reduceToObjectStream: function(transformFn) {
    var chunks = [];
    return through2.obj(
      function(chunk, enc, callback) {
        chunks.push(chunk);
        callback();
      },
      function(callback) {
        if (chunks.length > 0) {
          var obj = transformFn(Buffer.concat(chunks, _.reduce(chunks, 'length', 0)));
          if (_.isObject(obj)) { this.push(obj); }
        }
        callback();
      }
    );
  },
  streamToPromise: function(stream) {
    var deferred = Q.defer();
    if (isStream(stream)) {
      var eventName = _.findKey(STREAM_EVENT_MAP, function(isVerified, eventName) {
        return isVerified(stream);
      });
      stream.on(eventName, deferred.resolve);
      stream.on('error', deferred.reject.bind(deferred))
    } else {
      deferred.reject(new Error('Not a stream'));
    }
    return deferred.promise;
  },
  streamToArray: function(stream) {
    var deferred = Q.defer(),
        data = [];
    stream.on('data', data.push.bind(data))
    .once('end', deferred.resolve.bind(deferred, data))
    .once('error', deferred.reject.bind(deferred));
    return deferred.promise;
  }
};
