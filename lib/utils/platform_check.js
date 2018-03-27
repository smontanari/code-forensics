/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var shell = require('shelljs'),
    fs    = require('fs'),
    chalk = require('chalk');

var logErrorAndExit = function(message) {
  shell.echo(chalk.red("Platform dependency error\n" + message));
  shell.exit(1);
};

module.exports = {
  verifyExecutable: function(executable, errorMessage) {
    if (!shell.which(executable)) {
      logErrorAndExit(errorMessage);
    }
  },
  verifyPackage: function(shellCmd, expectedOutput, errorMessage) {
    var output = shell.exec(shellCmd, { silent: true }).stdout;
    if (expectedOutput !== output.trim()) {
      logErrorAndExit(errorMessage);
    }
  },
  verifyFile: function(filePath, errorMessage) {
    if (!fs.existsSync(filePath)) {
      logErrorAndExit(errorMessage);
    }
  }
};
