var _        = require('lodash'),
    Q        = require('q'),
    isStream = require('is-stream'),
    utils    = require('../utils');

module.exports = function(jobRunner) {
  var jobsPromises = [];

  var processTask = function(task) {
    if (isStream(task)) {
      return utils.stream.streamToPromise(task);
    } else if (_.isFunction(task)) {
      return Q(task());
    } else {
      return Q(task);
    }
  };

  this.processAll = function(taskFactoryList) {
    taskFactoryList.forEach(function(taskFn) {
      var deferred = Q.defer();
      jobsPromises.push(deferred.promise);
      jobRunner.addJob(function() {
        return processTask(taskFn()).then(deferred.resolve);
      });
    });
    return Q.allSettled(jobsPromises);
  };
};
