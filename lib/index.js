/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    minimist          = require('minimist'),
    mkdirp            = require('mkdirp'),
    glob              = require('glob'),
    logger            = require('./log'),
    TaskDefinitions   = require('./models/task/task_definitions'),
    taskHelpers       = require('./tasks/helpers'),
    TaskContext       = require('./runtime/task_context'),
    CFValidationError = require('./runtime/errors').CFValidationError;

module.exports.configure = function(configuration, params) {
  var parameters = _.extend({}, params, minimist(process.argv.slice(2)));
  try {
    var context = new TaskContext(configuration, parameters);
    var taskDefinitions = new TaskDefinitions(context);
    var helpers = taskHelpers(context);
    _.each(glob.sync('./tasks/**/*_tasks.js', { cwd: __dirname }), function(taskPath) {
      require(taskPath)(taskDefinitions, context, helpers).tasks();
    });

    mkdirp.sync(context.tempDir);
    mkdirp.sync(context.outputDir);
  } catch (e) {
    if (e instanceof CFValidationError) {
      logger.error(e.message);
      if (e.showStack) {
        logger.log(e.stack);
      }
      process.exit(1);
    } else {
      throw e;
    }
  }
};
