var _    = require('lodash'),
    gulp = require('gulp'),
    Task = require('./task');

var TaskConstructor = _.spread(Task);

var TaskDefinitions = function() {
  var tasks = [];

  this.add = function() {
    var task = new TaskConstructor(arguments);
    if (this.isTaskDefined(task.name)) {
      throw new Error('Task name ' + task.name + ' already defined');
    }
    tasks.push(task);

    gulp.task.apply(gulp, [task.name].concat(task.gulpParameters));
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
