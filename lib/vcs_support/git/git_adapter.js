var csvString     = require('csv-string'),
    StringDecoder = require('string_decoder').StringDecoder,
    logger        = require('../../log').Logger,
    command       = require('../../command');

var GIT_COMMANDS_ARGS = {
  gitlog_analysis: ['log', '--all', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%an'],
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

  this.revisions = function(filepath, timePeriod) {
    var gitOutput = command.run('git',
      GIT_COMMANDS_ARGS.gitlog_revisions
      .concat(['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate])
      .concat([filepath]),
      {cwd: rootDir});
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
      {cwd: rootDir});
  };

  this.logStream = function(timePeriod) {
    logger.info('Fetching git log ', 'from ' + timePeriod.startDate + ' to ' + timePeriod.endDate);
    return command.stream('git',
      GIT_COMMANDS_ARGS.gitlog_analysis
      .concat(['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate]),
      {cwd: rootDir});
  };

  this.commitMessagesStream = function(timePeriod) {
    logger.info('Fetching git messages ', 'from ' + timePeriod.startDate + ' to ' + timePeriod.endDate);
    return command.stream('git',
      GIT_COMMANDS_ARGS.gitlog_messages
      .concat(['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate]),
      {cwd: rootDir});
  };
};
