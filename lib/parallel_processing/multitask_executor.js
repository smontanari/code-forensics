var _           = require('lodash'),
    Q           = require('q'),
    stream      = require('stream'),
    isStream    = require('is-stream'),
    streamUtils = require('../utils').stream;

module.exports = function(jobRunner) {
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

  this.processAll = function(taskFactoryList) {
    taskFactoryList.forEach(function(taskFn) {
      jobRunner.addJob(function() {
        return _.tap(processTask(taskFn()), jobsPromises.push.bind(jobsPromises));
      });
    });
    return Q.allSettled(jobsPromises);
  };
};
