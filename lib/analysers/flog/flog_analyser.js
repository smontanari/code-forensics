var _             = require('lodash'),
    StringDecoder = require('string_decoder').StringDecoder,
    chalk         = require('chalk'),
    duplexer2     = require("duplexer2"),
    utils         = require('../../utils'),
    command       = require('../../command');

var FLOG_VERSION = '4.4.0';

command.Command.definitions.addDefinition('flog', {
  cmd: 'flog',
  args: ['-a'],
  installCheck: function() {
    this.findExecutable('ruby', 'Cannot find the ruby commmand.');
    this.verifyPackage('gem list flog -i -v ' + FLOG_VERSION, 'true', 'Missing "flog" gem, version ' + FLOG_VERSION);
  }
});

module.exports = function(parser) {
  command.Command.ensure('flog');

  var decoder = new StringDecoder();
  var analyse = function(filepath, content) {
    return _.extend({ path: filepath }, parser.read(decoder.write(content)));
  };

  this.fileAnalysisStream = function(filepath) {
    utils.log(chalk.yellow("Analysing ") + chalk.grey(filepath));
    return command.stream('flog', [filepath])
    .pipe(utils.stream.reduceToObjectStream(function(data) {
      return analyse(filepath, data);
    }));
  };

  this.sourceAnalysisStream = function(filepath) {
    var proc = command.create('flog', []).asyncProcess();
    var outputStream = proc.stdout.pipe(utils.stream.reduceToObjectStream(function(data) {
      return analyse(filepath, data);
    }));
    return duplexer2({ readableObjectMode: true }, proc.stdin, outputStream);
  };
};
