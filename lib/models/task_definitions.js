var _        = require('lodash'),
    gulp     = require('gulp'),
    GulpTask = require('./gulp_task');

var Task = _.spread(GulpTask);

var TaskDefinitions = function(context) {
  var tasks = [];

  this.add = function() {
    var task = new Task(arguments);
    if (this.isTaskDefined(task.name)) {
      throw new Error('Task name ' + task.name + ' already defined');
    }
    tasks.push(task);

    gulp.task.call(gulp, task.name, task.dependencies, function() {
      task.validateParameters(context.parameters);
      return task.taskFunction.apply(null, arguments);
    });
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
