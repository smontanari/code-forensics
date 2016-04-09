var _             = require('lodash'),
    StringDecoder = require('string_decoder').StringDecoder,
    chalk         = require('chalk'),
    duplexer2     = require("duplexer2"),
    utils         = require('../../utils'),
    command       = require('../../command');

module.exports = function(parser) {
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
