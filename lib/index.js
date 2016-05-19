var _               = require('lodash'),
    mkdirp          = require('mkdirp'),
    glob            = require('glob'),
    TaskDefinitions = require('./runtime/task_definitions'),
    TaskContext     = require('./runtime/task_context').TaskContext;

module.exports.configure = function(configuration, cmdlineParameters) {
  var config = _.defaults({}, configuration, {dateFormat: "YYYY-MM-DD"});

  var context = new TaskContext(config, cmdlineParameters);
  var taskDef = new TaskDefinitions();
  _.each(glob.sync('./tasks/*.js', { cwd: __dirname }), function(taskPath) {
    require(taskPath)(context, taskDef);
  });

  mkdirp(context.tempDir);
  mkdirp(context.outputDir);
};
