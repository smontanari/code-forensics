var _    = require('lodash'),
    gulp = require('gulp');

var convertArguments = function(args) {
  var name = args.shift();
  var nextArg = _.first(args);
  var description;
  if (_.isString(nextArg)) {
    description = args.shift();
  }

  return {
    taskName: name,
    taskDescription: description || 'No description available',
    gulpTaskParameters: args
  };
};

var TaskDefinitions = function() {
  var taskDescriptions = {};

  this.add = function() {
    var args = convertArguments(_.toArray(arguments));

    if (taskDescriptions[args.taskName]) throw new Error('Task name ' + args.taskName + ' already exist');
    taskDescriptions[args.taskName] = args.taskDescription;
    gulp.task.apply(gulp, [args.taskName].concat(args.gulpTaskParameters));
  };

  this.describe = function(taskName) {
    return taskDescriptions[taskName];
  };

  this.isTaskDefined = function(name) {
    return _.has(taskDescriptions, name);
  };
};

module.exports = TaskDefinitions;
