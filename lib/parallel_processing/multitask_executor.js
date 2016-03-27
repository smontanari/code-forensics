var _           = require('lodash'),
    Q           = require('q'),
    stream      = require('stream'),
    isStream    = require('is-stream'),
    streamUtils = require('../utils').stream;

module.exports = function(taskFactoryList) {
  var jobsPromises = [];

  var processTask = function(task) {
    if (isStream(task)) {
      return streamUtils.streamToPromise(task);
    } else if (_.isFunction(task)) {
      return Q(task());
    } else {
      return Q(task);
    }
  };

  this.runWith = function(jobRunner) {
    taskFactoryList.forEach(function(taskFn) {
      jobRunner.addJob(function() {
        return _.tap(processTask(taskFn()), function(promise) {
          jobsPromises.push(promise);
        });
      });
    });
    return Q.allSettled(jobsPromises);
  };
};
