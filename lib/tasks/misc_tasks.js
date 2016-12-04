var _         = require('lodash'),
    del       = require('del'),
    child     = require('child_process'),
    Path      = require('path'),
    Q         = require('q'),
    utils     = require('../utils'),
    logger    = require('../log').Logger,
    chalk     = require('chalk'),
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

  taskDef.addTask('generate-boundaries-file', {
    parameters: [{ name: 'boundary' }]
  }, function() {
    if (_.isEmpty(context.boundaries)) { return Q(); }
    var content = _.reduce(context.boundaries, function(lines, boundary) {
      return lines.concat(_.map(boundary.paths, function(path) { return path + ' => ' + boundary.name; }));
    }, []).join('\n');
    return utils.fileSystem.writeToFile(helpers.files.codeBoundaries(), content)
    .then(function() {
      logger.info('Created: ', helpers.files.codeBoundaries());
    });
  });

  taskDef.addTask('webserver', { description: 'Start local http server to display graphs' }, function() {
    var script = Path.resolve(Path.join(appConfig.get('basedir'), 'scripts/webserver.js'));
    child.execFileSync(script, ['-p', appConfig.get('serverPort'), '-d', context.outputDir], {stdio: 'inherit'});
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
    if (context.parameters.taskName) {
      var task = taskDef.getTask(context.parameters.taskName);
      logger.log([
        "\n" + chalk.cyan(task.name) + ': ' + task.description,
        chalk.yellow('Usage') + ': ' + task.usage
      ].join("\n"));
    } else {
      listTasks(taskDef.allTasks(), 'All tasks');
    }
  });

  taskDef.addTask('default', ['help']);
};
