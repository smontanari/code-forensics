/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _            = require('lodash'),
    stream       = require('stream'),
    childProcess = require('child_process'),
    appConfig    = require('../runtime/app_config'),
    logger       = require('../log'),
    utils        = require('../utils');

var dumpStderr = function(stderr) {
  var errorStream = appConfig.get('debugMode') ? process.stderr : new stream.Writable({ write: function(d, e, n) { n(); } });
  if (stderr instanceof stream.Stream && _.isFunction(stderr.pipe)) {
    stderr.pipe(errorStream);
  } else if (!_.isNull(stderr) && !_.isUndefined(stderr)) {
    errorStream.write(stderr.toString());
  }
};

var debug = function(program, parameters) {
  if (appConfig.get('debugMode')) {
    logger.debug('Running: ', [program].concat(parameters).join(' '));
  }
};

var Command = function(cmdName, args, opts) {
  var definition = Command.definitions.getDefinition(cmdName);
  this.program = definition.cmd;
  this.opts = opts;
  this.parameters = _.flattenDeep(
    _.map(definition.args.concat(args), function(arg) {
      if (_.isPlainObject(arg)) { return _.toPairs(arg); }
      return arg;
    })
  );
};

Command.prototype.toString = function() {
  return [this.program, this.parameters].join(' ');
};

Command.prototype.process = function(type) {
  debug(this.program, this.parameters);
  return _.tap(childProcess[type](this.program, this.parameters, this.opts), function(proc) {
    dumpStderr(proc.stderr);
  });
};

Command.prototype.syncProcess = function() {
  return this.process('spawnSync');
};

Command.prototype.asyncProcess = function() {
  return this.process('spawn');
};

Command.definitions = new utils.DefinitionsArchive();
Command.ensure = function(cmdName) {
  var definition = Command.definitions.getDefinition(cmdName);
  if (_.isFunction(definition.installCheck)) {
    definition.installCheck.apply(utils.platformCheck);
  }
};

Command.getConfig = function(cmdName) {
  var definition = Command.definitions.getDefinition(cmdName);
  return definition.config || {};
};

module.exports = Command;
