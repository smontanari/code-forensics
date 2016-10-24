var _               = require('lodash'),
    mkdirp          = require('mkdirp'),
    glob            = require('glob'),
    TaskDefinitions = require('./models/task_definitions'),
    TaskContext     = require('./runtime/task_context'),
    taskHelpers     = require('./tasks/helpers');

module.exports.configure = function(configuration, cmdlineParameters) {
  var taskDefinitions = new TaskDefinitions();
  var context = new TaskContext(configuration, cmdlineParameters);
  _.each(glob.sync('./tasks/*.js', { cwd: __dirname }), function(taskPath) {
    require(taskPath)(taskDefinitions, context, taskHelpers(context));
  });

  mkdirp.sync(context.tempDir);
  mkdirp.sync(context.outputDir);
};
