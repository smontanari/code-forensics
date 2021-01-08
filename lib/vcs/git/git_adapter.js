/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var csvString     = require('csv-string'),
    StringDecoder = require('string_decoder').StringDecoder,
    logger        = require('../../log'),
    command       = require('../../command');

var GIT_COMMANDS_ARGS = {
  gitlog_analysis: ['log', '--all', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%aN'],
  gitlog_messages: ['log', '--date=short', '--pretty=format:%s'],
  gitlog_revisions: ['log', '--date=iso-strict', '--pretty=format:%h,%ad'],
  git_show: ['show']
};

command.Command.definitions.addDefinition('git', {
  cmd: 'git',
  args: [],
  installCheck: function() {
    this.verifyExecutable('git', 'Cannot find the git commmand.');
  }
});

module.exports = function(repository) {
  var rootDir = repository.rootPath;
  command.Command.ensure('git');

  var decoder = new StringDecoder();

  var timePeriodArguments = function(timePeriod) {
    var isoPeriod = timePeriod.toISOFormat();
    return ['--after=' + isoPeriod.startDate, '--before=' + isoPeriod.endDate];
  };

  var logMessageWithTimePeriod = function(msg, timePeriod) {
    var displayPeriod = timePeriod.toDisplayFormat();
    logger.info(msg, ' from ' + displayPeriod.startDate + ' to ' + displayPeriod.endDate);
  };

  this.revisions = function(filepath, timePeriod) {
    var gitOutput = command.run('git',
      GIT_COMMANDS_ARGS.gitlog_revisions
      .concat(timePeriodArguments(timePeriod))
      .concat([filepath]),
      { cwd: rootDir });
    var output = decoder.write(gitOutput).trim();
    if (output.length > 0) {
      return csvString.parse(output, ',').map(function(row) {
        return { revisionId: row[0], date: row[1] };
      });
    }
    return [];
  };

  this.showRevisionStream = function(revisionId, filepath) {
    logger.info('Fetching git revision ', revisionId);
    return command.stream('git',
      GIT_COMMANDS_ARGS.git_show.concat([revisionId + ':' + filepath]),
      { cwd: rootDir });
  };

  this.logStream = function(timePeriod) {
    logMessageWithTimePeriod('Fetching git log', timePeriod);
    return command.stream('git',
      GIT_COMMANDS_ARGS.gitlog_analysis
      .concat(timePeriodArguments(timePeriod)),
      { cwd: rootDir });
  };

  this.commitMessagesStream = function(timePeriod) {
    logMessageWithTimePeriod('Fetching git messages', timePeriod);
    return command.stream('git',
      GIT_COMMANDS_ARGS.gitlog_messages
      .concat(timePeriodArguments(timePeriod)),
      { cwd: rootDir });
  };
};
