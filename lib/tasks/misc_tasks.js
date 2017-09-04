/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _         = require('lodash'),
    del       = require('del'),
    child     = require('child_process'),
    Path      = require('path'),
    Bluebird  = require('bluebird'),
    chalk     = require('chalk'),
    utils     = require('../utils'),
    logger    = require('../log').Logger,
    appConfig = require('../runtime/app_config');

module.exports = function(taskDef, context, helpers) {
  var listTasks = function(tasks, title) {
    var maxTaskNameLength = _.maxBy(tasks, function(t) { return t.name.length; }).name.length;
    var outputLines = [chalk.yellow("\n" + title)];
    _.each(tasks, function(task) {
      outputLines.push(['*', chalk.cyan(_.padEnd(task.name, maxTaskNameLength)) + ':', task.description].join(' '));
    });
    logger.log(outputLines.join("\n"));
  };

  taskDef.addTask('generate-layer-grouping-file', {
    parameters: [{ name: 'layerGroup' }]
  }, function() {
    del.sync(helpers.files.layerGrouping());
    if (context.layerGrouping.isEmpty()) {
      logger.warn('No layer group parameter specified. No grouping file created.');
      return Bluebird.resolve();
    }
    return utils.fileSystem.writeToFile(helpers.files.layerGrouping(), context.layerGrouping.toString())
    .then(function() {
      logger.info('Created: ', helpers.files.layerGrouping());
    });
  });

  taskDef.addTask('webserver', { description: 'Start local http server to display graphs' }, function() {
    var script = Path.resolve(Path.join(appConfig.get('basedir'), 'scripts/webserver.js'));
    child.execFileSync(script, ['-p', appConfig.get('serverPort'), '-d', context.outputDir], { stdio: 'inherit' });
  });

  taskDef.addTask('clean', { description: 'Delete all analysis reports and files' }, function() {
    return del([context.tempDir + '/*', context.outputDir + '/*']);
  });

  taskDef.addTask('list-analysis-tasks', { description: 'List all available analysis tasks' }, function() {
    listTasks(taskDef.analysisTasks(), 'Analysis tasks');
  });

  taskDef.addTask('help',
    {
      description: 'List all tasks or show help on a particular task',
      parameters: [{ name: 'taskName' }]
    }, function() {
    if (_.isEmpty(context.parameters.taskName)) {
      listTasks(taskDef.allTasks(), 'All tasks');
    } else {
      var task = taskDef.getTask(context.parameters.taskName);
      logger.log([
        "\n" + chalk.cyan(task.name) + ': ' + task.description,
        chalk.yellow('Usage') + ': ' + task.usage
      ].join("\n"));
    }
  });

  taskDef.addTask('default', ['help']);
};
