var _        = require('lodash'),
    gulp     = require('gulp'),
    GulpTask = require('./gulp_task'),
    DefaultRunner = require('./default_runner'),
    ReportRunner = require('./report_runner');


var Task = _.spread(GulpTask);

var TaskDefinitions = function(context) {
  var tasks = [];

  var createTask = function() {
    var task = new Task(arguments);
    if (this.isTaskDefined(task.name)) {
      throw new Error('Task name ' + task.name + ' already defined');
    }
    tasks.push(task);
    return task;
  };

  var registerTask = function(task, TaskRunner) {
    gulp.task.call(gulp, task.name, task.dependencies, function() {
      task.validateParameters(context.parameters);
      return new TaskRunner(task, context).run(arguments);
    });
  };

  this.add = function() {
    registerTask(createTask.apply(this, arguments), DefaultRunner);
  };

  this.addAnalysisTask = function() {
    registerTask(createTask.apply(this, arguments), ReportRunner);
  };

  this.getTask = function(taskName) {
    return _.find(tasks, { 'name': taskName });
  };

  this.isTaskDefined = function(taskName) {
    return this.getTask(taskName) !== undefined;
  };

  this.topLevelTasks = function() {
    return _.filter(tasks, 'isTopLevel');
  };
};

module.exports = TaskDefinitions;
