/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _        = require('lodash'),
    Bluebird = require('bluebird');

module.exports = function(jobScheduler) {
  var processTask = function(task) {
    if (_.isFunction(task)) {
      return Bluebird.try(task);
    }
    return Bluebird.resolve(task);
  };

  this.runAll = function(iterable, taskFn) {
    var tasksPromises = _.map(iterable, function(item) {
      return jobScheduler.addJob(function() {
        var taskOutput = _.isFunction(taskFn) ? taskFn(item) : item();
        return processTask(taskOutput);
      }).reflect();
    });
    return Bluebird.all(tasksPromises);
  };
};
