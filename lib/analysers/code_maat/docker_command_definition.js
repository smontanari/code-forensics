/*
 * code-forensics
 * Copyright (C) 2016-2020 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var command   = require('../../command'),
    appConfig = require('../../runtime/app_config');

var CONTAINER_DATA_FOLDER = '/data';
var dockerCommandDefinition = function() {
  var dockerImage = appConfig.get('codeMaat.docker.image');
  var hostVolume = appConfig.get('codeMaat.docker.volume') || process.cwd();
  command.Command.definitions.addDefinition('codemaat-docker', {
    cmd: 'docker',
    args: [
      'run',
      '--rm',
      '-v',
      hostVolume + ':' + CONTAINER_DATA_FOLDER,
      dockerImage
    ],
    installCheck: function() {
      this.verifyExecutable('docker', 'Cannot find the docker commmand.');
      this.verifyConfigurationProperty(appConfig, 'codeMaat.docker.image', 'Missing required configuration property "codeMaat.docker.image"');
    },
    config: {
      hostVolume: hostVolume,
      containerVolume: CONTAINER_DATA_FOLDER
    }
  });
};

module.exports = dockerCommandDefinition;
