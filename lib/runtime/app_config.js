/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                = require('lodash'),
    Path             = require('path'),
    FileConfigReader = require('./file_config_reader'),
    EnvConfigReader  = require('./env_config_reader');

var DEFAULT_CONFIG = {
  basedir: Path.resolve(Path.join(__dirname, '..', '..')),
  versionControlSystem: 'git',
  serialProcessing: false,
  debugMode: false,
  logEnabled: true,
  serverPort: 3000
};

var fileConfigReader = new FileConfigReader();
var envConfigReader = new EnvConfigReader();

var configurationInstance = {};
var getConfiguration = function() {
  if (_.isEmpty(configurationInstance)) {
    configurationInstance = _.defaultsDeep(envConfigReader.getConfiguration(), fileConfigReader.getConfiguration(), DEFAULT_CONFIG);
  }
  return configurationInstance;
};

module.exports = {
  get: function(property) {
    return _.get(getConfiguration(), property);
  }
};
