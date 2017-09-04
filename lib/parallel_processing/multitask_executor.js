/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _        = require('lodash'),
    Bluebird = require('bluebird'),
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
      return Bluebird.attempt(task);
    } else {
      return Bluebird.resolve(task);
    }
  };

  var createJob = function(taskFn, resolve, reject) {
    return Bluebird.attempt(taskFn)
      .then(processTask)
      .then(resolve)
      .catch(function(error) {
        logger.warn(error);
        reject(error);
      });
  };

  this.processAll = function(taskFactoryList) {
    var jobsPromises = _.map(taskFactoryList, function(taskFn) {
      return new Bluebird(function(resolve, reject) {
        jobRunner.addJob(function() {
          return createJob(taskFn, resolve, reject);
        });
      }).reflect();
    });
    return Bluebird.all(jobsPromises);
  };
};
