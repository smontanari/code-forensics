var _             = require('lodash'),
    stream        = require('stream'),
    childProcess  = require('child_process'),
    chalk         = require('chalk'),
    appConfig     = require('../runtime/app_config'),
    utils         = require('../utils');

var dumpStderr = function(stderr) {
  var errorStream = appConfig.debugMode ? process.stderr : new stream.Writable({write: function(d, e, n) { n(); }});
  if (stderr instanceof stream.Stream && _.isFunction(stderr.pipe)) {
    stderr.pipe(errorStream);
  } else if (!_.isNull(stderr) && !_.isUndefined(stderr)) {
    errorStream.write(stderr.toString());
  }
};

var debug = function(program, parameters) {
  if (appConfig.debugMode) {
    utils.log(chalk.green("Running: ") + program + " " + parameters.join(" "));
  }
};

var Command = function(cmdName, args, opts) {
  var definition = Command.definitions.getDefinition(cmdName);
  this.program = definition.cmd;
  this.parameters = definition.args.concat(args);
  this.opts = opts;
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

module.exports = Command;
