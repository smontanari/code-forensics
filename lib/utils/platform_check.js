var shell  = require("shelljs"),
    chalk = require('chalk');

var logErrorAndExit = function(message) {
  shell.echo(chalk.red("Platform dependency error\n" + message));
  shell.exit(1);
};

module.exports = {
  findExecutable: function(executable, errorMessage) {
    if (!shell.which(executable)) {
      logErrorAndExit(errorMessage);
    }
  },
  verifyPackage: function(shellCmd, expectedOutput, errorMessage) {
    var output = shell.exec(shellCmd, { silent: true }).stdout;
    if (expectedOutput !== output.trim()) {
      logErrorAndExit(errorMessage);
    }
  }
};
