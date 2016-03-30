var StringDecoder = require('string_decoder').StringDecoder,
    chalk         = require('chalk'),
    duplexer2     = require("duplexer2"),
    utils         = require('../../utils'),
    command       = require('../../command');

module.exports = function(parser) {
  var decoder = new StringDecoder();

  this.fileAnalysisStream = function(filepath) {
    utils.log(chalk.yellow("Analysing ") + chalk.grey(filepath));
    return command.stream('flog', [filepath])
    .pipe(utils.stream.reduceToObjectStream(function(data) {
      return parser.read(decoder.write(data));
    }));
  };

  this.sourceAnalysisStream = function() {
    var proc = command.create('flog', []).asyncProcess();
    var outputStream = proc.stdout.pipe(utils.stream.reduceToObjectStream(function(data) {
      return parser.read(decoder.write(data));
    }));
    return duplexer2({ readableObjectMode: true }, proc.stdin, outputStream);
  };
};
