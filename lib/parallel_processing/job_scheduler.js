/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Bluebird = require('bluebird'),
    logger   = require('../log');

module.exports = function(maxParallelProcs) {
  var maxConcurrentJobs = maxParallelProcs || 1;
  var activeProcs = 0;

  var jobQueue = [];

  var onJobFinished = function() {
    activeProcs--;
    executeNext();
  };

  var executeNext = function() {
    if (jobQueue.length > 0 && activeProcs < maxConcurrentJobs) {
      activeProcs++;
      jobQueue.shift().call().then(onJobFinished);
    }
  };

  this.addJob = function(jobFn) {
    return new Bluebird(function(resolve, reject) {
      jobQueue.push(function() {
        return Bluebird.try(jobFn)
          .then(resolve)
          .catch(function(err) {
            logger.warn(err);
            reject(err);
          });
      });
      executeNext();
    });
  };
};
