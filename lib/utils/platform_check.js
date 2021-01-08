/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var shell = require('shelljs'),
    fs    = require('fs'),
    ansi  = require('ansi-colors');

var logErrorAndExit = function(message) {
  shell.echo(ansi.red('Platform dependency error\n' + message));
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
  },
  verifyConfigurationProperty: function(config, prop, errorMessage) {
    if (!config.get(prop)) {
      logErrorAndExit(errorMessage);
    }
  }
};
