var _               = require('lodash'),
    mkdirp          = require('mkdirp'),
    glob            = require('glob'),
    TaskDefinitions = require('./models/task/task_definitions'),
    TaskContext     = require('./runtime/task_context'),
    taskHelpers     = require('./tasks/helpers');

module.exports.configure = function(configuration, cmdlineParameters) {
  var context = new TaskContext(configuration, cmdlineParameters);
  var taskDefinitions = new TaskDefinitions(context);
  var helpers = taskHelpers(context);
  _.each(glob.sync('./tasks/*.js', { cwd: __dirname }), function(taskPath) {
    require(taskPath)(taskDefinitions, context, helpers);
  });

  mkdirp.sync(context.tempDir);
  mkdirp.sync(context.outputDir);
};
