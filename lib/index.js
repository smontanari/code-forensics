var _               = require('lodash'),
    mkdirp          = require('mkdirp'),
    glob            = require('glob'),
    TaskDefinitions = require('./runtime/task_definitions'),
    TaskContext     = require('./runtime/task_context').TaskContext,
    taskHelpers     = require('./tasks/helpers');

module.exports.configure = function(configuration, cmdlineParameters) {
  var config = _.defaults({}, configuration, {dateFormat: "YYYY-MM-DD"});
  var taskDefinitions = new TaskDefinitions();
  var context = new TaskContext(config, cmdlineParameters);
  _.each(glob.sync('./tasks/*.js', { cwd: __dirname }), function(taskPath) {
    require(taskPath)(taskDefinitions, context, taskHelpers(context));
  });

  mkdirp(context.tempDir);
  mkdirp(context.outputDir);
};
