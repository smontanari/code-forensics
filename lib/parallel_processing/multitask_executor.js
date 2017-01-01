/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _        = require('lodash'),
    Q        = require('q'),
    isStream = require('is-stream'),
    logger   = require('../log').Logger,
    utils    = require('../utils');

module.exports = function(jobRunner, opts) {
  var options = opts || {};

  var processTask = function(task) {
    if (isStream(task)) {
      if (options.captureStreamResults) {
        return utils.stream.objectStreamToArray(task);
      }
      return utils.stream.streamToPromise(task);
    } else if (_.isFunction(task)) {
      return Q.Promise(function(resolve) { return resolve(task()); });
    } else {
      return Q(task);
    }
  };

  var createJob = function(taskFn, deferred) {
    try {
      return processTask(taskFn())
        .then(deferred.resolve.bind(deferred))
        .catch(function(error) {
          logger.warn(error);
          deferred.reject(error);
        });
    } catch(error) {
      logger.warn(error);
      deferred.reject(error);
    }
  };

  this.processAll = function(taskFactoryList) {
    var jobsPromises = [];

    _.each(taskFactoryList, function(taskFn) {
      var deferred = Q.defer();
      jobsPromises.push(deferred.promise);
      jobRunner.addJob(function() {
        return createJob(taskFn, deferred);
      });
    });
    return Q.allSettled(jobsPromises);
  };
};
