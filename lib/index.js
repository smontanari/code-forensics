/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    minimist          = require('minimist'),
    mkdirp            = require('mkdirp'),
    glob              = require('glob'),
    TaskDefinitions   = require('./models/task/task_definitions'),
    TaskContext       = require('./runtime/task_context'),
    taskHelpers       = require('./tasks/helpers'),
    logger            = require('./log').Logger,
    CFValidationError = require('./models/validation_error');

module.exports.configure = function(configuration, params) {
  var parameters = _.extend({}, params, minimist(process.argv.slice(2)));
  try {
    var context = new TaskContext(configuration, parameters);
    var taskDefinitions = new TaskDefinitions(context);
    var helpers = taskHelpers(context);
    _.each(glob.sync('./tasks/*.js', { cwd: __dirname }), function(taskPath) {
      require(taskPath)(taskDefinitions, context, helpers);
    });

    mkdirp.sync(context.tempDir);
    mkdirp.sync(context.outputDir);
  } catch (e) {
    if (e instanceof CFValidationError) { logger.error(e.message); }
    throw e;
  }
};
