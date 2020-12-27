/*
 * code-forensics
 * Copyright (C) 2016-2020 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var Path = require('path');

var command   = require('../../command'),
    appConfig = require('../../runtime/app_config');

module.exports = function() {
  var codeMaatPackage = appConfig.get('codeMaat.packageFile') || Path.join(__dirname, 'code-maat-1.0.1-standalone.jar');
  command.Command.definitions.addDefinition('codemaat', {
    cmd: 'java',
    args: [
      '-Djava.awt.headless=true',
      { '-jar': codeMaatPackage }
    ],
    installCheck: function() {
      this.verifyExecutable('java', 'Cannot find the java commmand.');
      this.verifyFile(codeMaatPackage, 'Cannot find the codemaat jar at: ' + codeMaatPackage);
    }
  });
};
