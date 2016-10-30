var _        = require('lodash'),
    gulp     = require('gulp'),
    GulpTask = require('./gulp_task'),
    runners  = require('./runners');

var Task = _.spread(GulpTask);

var TaskDefinitions = function(context) {
  var tasks = {
    analysisTasks: [],
    otherTasks: []
  };

  var createTask = function() {
    var task = new Task(_.toArray(arguments));
    if (this.isTaskDefined(task.name)) {
      throw new Error('Task name ' + task.name + ' already defined');
    }

    return task;
  };

  var registerTask = function(task, TaskRunner) {
    gulp.task.call(gulp, task.name, task.dependencies, function() {
      task.validateParameters(context.parameters);
      return new TaskRunner(task, context).run(_.toArray(arguments));
    });
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
    return _.find(this.allTasks(), { 'name': taskName });
  };

  this.isTaskDefined = function(taskName) {
    return this.getTask(taskName) !== undefined;
  };
};

module.exports = TaskDefinitions;
