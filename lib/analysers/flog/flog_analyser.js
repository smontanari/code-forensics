/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _             = require('lodash'),
    StringDecoder = require('string_decoder').StringDecoder,
    duplexer2     = require('duplexer2'),
    logger        = require('../../log').Logger,
    utils         = require('../../utils'),
    command       = require('../../command');

var FLOG_VERSION = '4.4.0';

command.Command.definitions.addDefinition('flog', {
  cmd: 'flog',
  args: ['-a'],
  installCheck: function() {
    this.verifyExecutable('ruby', 'Cannot find the ruby commmand.');
    this.verifyPackage('gem list flog -i -v ' + FLOG_VERSION, 'true', 'Missing "flog" gem, version ' + FLOG_VERSION);
  }
});

module.exports = function(parser) {
  command.Command.ensure('flog');

  var decoder = new StringDecoder();
  var analyse = function(filepath, content, transformFn) {
    var report = _.extend({ path: filepath }, parser.read(decoder.write(content)));
    if (_.isFunction(transformFn)) {
      return transformFn(report);
    }
    return report;
  };

  this.fileAnalysisStream = function(filepath, transformFn) {
    logger.info('Analysing ', filepath);
    return command.stream('flog', [filepath])
    .pipe(utils.stream.reduceToObjectStream(function(data) {
      return analyse(filepath, data, transformFn);
    }));
  };

  this.sourceAnalysisStream = function(filepath, transformFn) {
    var proc = command.create('flog', []).asyncProcess();
    var outputStream = proc.stdout.pipe(utils.stream.reduceToObjectStream(function(data) {
      return analyse(filepath, data, transformFn);
    }));
    return duplexer2({ readableObjectMode: true }, proc.stdin, outputStream);
  };
};
