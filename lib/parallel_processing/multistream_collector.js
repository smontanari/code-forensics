var PassThrough = require('stream').PassThrough,
    chalk       = require('chalk'),
    Q           = require('q'),
    log         = require('../utils').log;

module.exports = function(streamFactoryList, streamOptions) {
  var collectorStream = new PassThrough(streamOptions);
  var completedStreams = 0;

  var processStream = function(stream) {
    var deferred = Q.defer();
    stream.on('data', function(chunk) { collectorStream.write(chunk); });
    stream.once('end', deferred.resolve);
    stream.once('error', function(err) {
      log(chalk.red("Error processing stream: " + err));
      deferred.reject();
    });
    return deferred.promise;
  };

  var checkAllStreams = function() {
    if (completedStreams == streamFactoryList.length) {
      collectorStream.end();
    }
  };

  var onCompletedStream = function() {
    completedStreams++;
    checkAllStreams();
  };

  this.runWith = function(jobRunner) {
    streamFactoryList.forEach(function(streamFn) {
      jobRunner.addJob(function() {
        return processStream(streamFn()).then(onCompletedStream);
      });
    });
    checkAllStreams();
    return collectorStream;
  };
};
