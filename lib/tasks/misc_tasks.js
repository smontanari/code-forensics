/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _         = require('lodash'),
    del       = require('del'),
    child     = require('child_process'),
    Path      = require('path'),
    Bluebird  = require('bluebird'),
    ansi      = require('ansi-colors'),
    utils     = require('../utils'),
    logger    = require('../log'),
    appConfig = require('../runtime/app_config');

module.exports = function(taskDef, context, helpers) {
  var generateLayerGroupingFile = function(layerGroup) {
    var filename = helpers.files.layerGrouping(layerGroup.name);
    del.sync(filename);
    return utils.fileSystem.writeToFile(filename, layerGroup.toString())
    .then(function() {
      logger.info('Created: ', filename);
    });
  };

  var generateLayerGroupingFiles = function() {
    if (context.layerGrouping.isEmpty()) {
      logger.warn('No layer group parameter specified. No grouping files created.');
      return Bluebird.resolve();
    }
    return Bluebird.all(
      context.layerGrouping.map(generateLayerGroupingFile)
        .concat([generateLayerGroupingFile(context.layerGrouping)])
      );
  };

  var listTasks = function(tasks, title) {
    var maxTaskNameLength = _.maxBy(tasks, function(t) { return t.name.length; }).name.length;
    var outputLines = [ansi.yellow('\n' + title)];
    _.each(tasks, function(task) {
      outputLines.push(['*', ansi.cyan(_.padEnd(task.name, maxTaskNameLength)) + ':', task.description].join(' '));
    });
    console.log(outputLines.join('\n')); //eslint-disable-line no-console
  };

  var printHelp = function(done) {
    if (_.isEmpty(context.parameters.taskName)) {
      listTasks(taskDef.allTasks(), 'All tasks');
    } else {
      var task = taskDef.getTask(context.parameters.taskName);
      //eslint-disable-next-line no-console
      console.log([
        '\n' + ansi.cyan(task.name) + ': ' + task.description,
        ansi.yellow('Usage') + ': ' + task.usage
      ].join('\n'));
    }
    done();
  };

  var listAnalysisTasks = function(done) {
    listTasks(taskDef.analysisTasks(), 'Analysis tasks');
    done();
  };

  return {
    functions: {
      generateLayerGroupingFiles: generateLayerGroupingFiles
    },
    tasks: function() {
      taskDef.addTask('generate-layer-grouping-files', { parameters: [{ name: 'layerGroup' }] }, generateLayerGroupingFiles);

      taskDef.addTask('webserver', { description: 'Start local http server to display graphs' }, function() {
        var script = Path.resolve(Path.join(appConfig.get('basedir'), 'scripts', 'webserver.js'));
        child.execFileSync(script, ['-p', appConfig.get('serverPort'), '-d', context.outputDir], { stdio: 'inherit' });
      });

      taskDef.addTask('clean', { description: 'Delete all analysis reports and files' }, function() {
        return del([Path.join(context.tempDir, '*'), Path.join(context.outputDir, '*')]);
      });

      taskDef.addTask('clear-logs', { description: 'Delete all generated log files' }, function() {
        return del([Path.join(context.tempDir, '*.log')]);
      });

      taskDef.addTask('list-analysis-tasks', { description: 'List all available analysis tasks' }, listAnalysisTasks);

      taskDef.addTask('help',
        {
          description: 'List all tasks or show help on a particular task',
          parameters: [{ name: 'taskName' }]
        }, printHelp);

      taskDef.addTask('default', listAnalysisTasks);
    }
  };
};
