var _           = require('lodash'),
    fs          = require('fs'),
    Q           = require('q'),
    isStream    = require('is-stream'),
    through2    = require('through2'),
    PassThrough = require('stream').PassThrough;

module.exports = {
  readFileToObjectStream: function(filepath, transformFn) {
    return _.tap(new PassThrough({objectMode: true}), function(outStream) {
      fs.readFile(filepath, function(err, data) {
        var outputObject = transformFn(data);
        if (_.isObject(outputObject)) { outStream.write(outputObject); }
        outStream.end();
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
    var streamEventMap = {
      end: function(s) { return isStream.readable(s); },
      finish: function(s) { return isStream.writable(s); }
    };
    var deferred = Q.defer();
    _.each(streamEventMap, function(isVerified, eventName) {
      if (isVerified(stream)) {
        stream.once(eventName, deferred.resolve);
      };
    });
    return deferred.promise;
  }
};
