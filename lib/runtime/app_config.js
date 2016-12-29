/*
 * code-forensics
 * Copyright (C) 2016 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _             = require('lodash'),
    Path          = require('path'),
    fs            = require('fs'),
    os            = require('os'),
    StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../utils');

var CONFIG_FILENAME = '.code-forensics';
var decoder = new StringDecoder();

var DEFAULT_CONFIG = {
  basedir: Path.resolve(Path.join(__dirname, '..', '..')),
  versionControlSystem: 'git',
  maxConcurrency: os.cpus().length,
  debugMode: false,
  logEnabled: true,
  serverPort: 3000
};

var readConfigFromFile = function() {
  var file = Path.resolve(CONFIG_FILENAME);
  if (utils.fileSystem.isFile(file)) {
    return JSON.parse(decoder.write(fs.readFileSync(file)));
  }
  return {};
};

var readConfigFromEnv = function() {
  var maxParallel = parseInt(process.env.MAX_PARALLEL);
  var codeMaatOptions = process.env.CODEMAAT_OPTS;
  return {
    maxConcurrency: _.isInteger(maxParallel) ? maxParallel : undefined,
    debugMode: _.isUndefined(process.env.COMMAND_DEBUG) ? undefined : true,
    logEnabled: _.isUndefined(process.env.LOG_DISABLED) ? undefined : false,
    serverPort: process.env.SERVER_PORT,
    codeMaat: { options: _.isString(codeMaatOptions) ? utils.arrayPairsToObject(codeMaatOptions.split(' ')) : undefined }
  };
};

var singletonConfig = _.defaultsDeep(readConfigFromEnv(), readConfigFromFile(), DEFAULT_CONFIG);

module.exports = {
  get: function(property) {
    return _.get(singletonConfig, property);
  }
};
