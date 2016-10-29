var _         = require('lodash'),
    del       = require('del'),
    child     = require('child_process'),
    Path      = require('path'),
    utils     = require('../utils'),
    logger    = require('../log').Logger,
    chalk     = require('chalk'),
    appConfig = require('../runtime/app_config');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('generate-boundaries-file', function() {
    var content = _.reduce(context.boundaries, function(lines, boundary) {
      return lines.concat(_.map(boundary.paths, function(path) { return path + ' => ' + boundary.name; }));
    }, []).join('\n');
    return utils.fileSystem.writeToFile(helpers.files.codeBoundaries(), content);
  });

  taskDef.add('webserver', { description: 'Start local http server to display graphs' }, function() {
    var script = Path.resolve(Path.join(appConfig.get('basedir'), 'scripts/webserver.js'));
    child.execFileSync(script, ['-p', appConfig.get('serverPort'), '-d', context.outputDir], {stdio: 'inherit'});
  });

  taskDef.add('clean', { description: 'Delete all analysis reports and files' }, function() {
    return del([context.tempDir + '/*', context.outputDir + '/*']);
  });

  taskDef.add('help',
    {
      description: 'List all analysis tasks or show help on a particular task',
      parameters: [{ name: 'taskName' }]
    }, function() {
    if (context.parameters.taskName) {
      var task = taskDef.getTask(context.parameters.taskName);
      logger.log([
        "\n" + chalk.cyan(task.name) + ': ' + task.description,
        chalk.yellow('Usage') + ': ' + task.usage
      ].join("\n"));
    } else {
      var tasks = taskDef.topLevelTasks();
      var maxTaskNameLength = _.maxBy(tasks, function(t) { return t.name.length; }).name.length;
      var outputLines = [chalk.yellow("\nAvailable analysis tasks")];
      _.each(tasks, function(task) {
        outputLines.push(['*', chalk.cyan(_.padEnd(task.name, maxTaskNameLength)) + ':', task.description].join(' '));
      });
      logger.log(outputLines.join("\n"));
    }
  });

  taskDef.add('default', ['help']);
};
