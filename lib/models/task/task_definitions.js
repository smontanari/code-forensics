/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    gulp              = require('gulp'),
    GulpTask          = require('./gulp_task'),
    runners           = require('./runners'),
    CFValidationError = require('../../runtime/errors').CFValidationError;

var Task = _.spread(GulpTask);

var TaskDefinitions = function(context) {
  var self = this;
  var tasks = {
    analysisTasks: [],
    otherTasks: []
  };

  var createTask = function() {
    var task = new Task(_.toArray(arguments));
    if (this.isTaskDefined(task.name)) {
      throw new CFValidationError('Task name ' + task.name + ' already defined');
    }

    return task;
  };

  var registerTask = function(task, TaskRunner) {
    var parametersValidation, taskRun;

    if (task.parameters.length > 0) {
      parametersValidation = function(done) {
        task.validateParameters(context.parameters);
        done();
      };
    }
    if (task.run) {
      taskRun = new TaskRunner(task, context).run;
    }

    var taskFns = _.compact([parametersValidation, task.dependency, taskRun]);
    if (taskFns.length > 1) {
      gulp.task(task.name, gulp.series.apply(gulp, taskFns));
    } else {
      gulp.task(task.name, taskFns.pop());
    }

    gulp.task(task.name).description = task.description;
  };

  var findTask = function(taskName) {
    return _.find(self.allTasks(), { 'name': taskName });
  };

  this.allTasks = function() {
    return (_.flatMap(tasks));
  };

  this.analysisTasks = function() {
    return tasks.analysisTasks;
  };

  this.addTask = function() {
    var task = createTask.apply(this, arguments);
    registerTask(task, runners.Default);
    tasks.otherTasks.push(task);
  };

  this.addAnalysisTask = function() {
    var task = createTask.apply(this, arguments);
    registerTask(task, runners.Report);
    tasks.analysisTasks.push(task);
  };

  this.getTask = function(taskName) {
    var task = findTask(taskName);
    if (_.isUndefined(task)) {
      throw new CFValidationError('Task not defined: ' + taskName);
    }
    return task;
  };

  this.isTaskDefined = function(taskName) {
    return findTask(taskName) !== undefined;
  };
};

module.exports = TaskDefinitions;
