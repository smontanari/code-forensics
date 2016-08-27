var csvString     = require('csv-string'),
    chalk         = require('chalk'),
    StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../../utils'),
    command       = require('../../command');

var GIT_COMMANDS_ARGS = {
  gitlog_analysis: ['log', '--all', '-M', '-C', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%an'],
  gitlog_messages: ['log', '--date=short', '--pretty=format:%s'],
  gitlog_revisions: ['log', '--date=iso', '--pretty=format:%h,%ad'],
  git_show: ['show']
};

command.Command.definitions.addDefinition('git', {
  cmd: 'git',
  args: [],
  installCheck: function() {
    this.findExecutable('git', 'Cannot find the git commmand.');
  }
});

module.exports = function(rootDir) {
  command.Command.ensure('git');

  var decoder = new StringDecoder();

  this.revisions = function(filepath, timePeriod) {
    var gitOutput = command.run('git',
      GIT_COMMANDS_ARGS.gitlog_revisions
      .concat(['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate])
      .concat([filepath]),
      {cwd: rootDir});
    return csvString.parse(decoder.write(gitOutput), ',').map(function(row) {
      return {
        revisionId: row[0],
        date: row[1],
      };
    });
  };

  this.showRevisionStream = function(revisionId, filepath) {
    utils.log(chalk.yellow("Fetching git revision ") + chalk.grey(revisionId));
    return command.stream('git',
      GIT_COMMANDS_ARGS.git_show.concat([revisionId + ":" + filepath]),
      {cwd: rootDir});
  };

  this.logStream = function(timePeriod) {
    utils.log(chalk.yellow("Fetching git log ") + chalk.grey("from " + timePeriod.startDate + " to " + timePeriod.endDate));
    return command.stream('git',
      GIT_COMMANDS_ARGS.gitlog_analysis
      .concat(['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate]),
      {cwd: rootDir});
  };

  this.commitMessagesStream = function(timePeriod) {
    utils.log(chalk.yellow("Fetching git messages ") + chalk.grey("from " + timePeriod.startDate + " to " + timePeriod.endDate));
    return command.stream('git',
      GIT_COMMANDS_ARGS.gitlog_messages
      .concat(['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate]),
      {cwd: rootDir});
  };
};
