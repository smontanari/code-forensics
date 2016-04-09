var del       = require('del'),
    child     = require('child_process'),
    Path      = require('path'),
    appConfig = require('../runtime/app_config');

module.exports = function(context, taskDef) {
  taskDef.add('webserver', 'Start local http server to display graphs', function() {
    var script = Path.resolve(Path.join(appConfig.basedir, 'scripts/webserver.js'));
    child.execFileSync(script, ['-p', appConfig.serverPort, '-d', context.outputDir], {stdio: 'inherit'});
  });

  taskDef.add('clean', 'Delete any generated analysis files', function() {
    del([context.tempDir + "/*", context.outputDir + "/*"]);
  });

  taskDef.add('help', "Display help on a particular task\nUsage: gulp help --taskName <task>", function() {
    console.log("\n" + context.taskName + ': ' + taskDef.describe(context.taskName || 'help') + "\n");
  });
};
