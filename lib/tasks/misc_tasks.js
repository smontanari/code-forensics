var _         = require('lodash'),
    del       = require('del'),
    child     = require('child_process'),
    Path      = require('path'),
    utils     = require('../utils'),
    logger    = require('../log').Logger,
    appConfig = require('../runtime/app_config');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('generate-boundaries-file', function() {
    var content = _.reduce(context.boundaries, function(lines, boundary) {
      return lines.concat(_.map(boundary.paths, function(path) { return path + ' => ' + boundary.name; }));
    }, []).join('\n');
    return utils.fileSystem.writeToFile(helpers.files.codeBoundaries(), content);
  });

  taskDef.add('webserver', 'Start local http server to display graphs', function() {
    var script = Path.resolve(Path.join(appConfig.get('basedir'), 'scripts/webserver.js'));
    child.execFileSync(script, ['-p', appConfig.get('serverPort'), '-d', context.outputDir], {stdio: 'inherit'});
  });

  taskDef.add('clean', 'Delete any generated analysis files', function() {
    return del([context.tempDir + '/*', context.outputDir + '/*']);
  });

  taskDef.add('help', 'Display help on a particular task\nUsage: gulp help --taskName <task>', function() {
    logger.log("\n" + context.parameters.taskName + ': ' + taskDef.describe(context.parameters.taskName || 'help') + "\n");
  });
};
