var csvString     = require('csv-string'),
    StringDecoder = require('string_decoder').StringDecoder,
    LineStream    = require('byline').LineStream,
    map           = require('through2-map'),
    logger        = require('../../log').Logger,
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

module.exports = function(rootDir, developerInfo) {
  command.Command.ensure('git');

  var AUTHOR_REGEXP = /^--[a-z0-9]+--[0-9-]+--(.*)$/;

  var decoder = new StringDecoder();

  var normaliseCommitAuthorData = function(line) {
    var match = AUTHOR_REGEXP.exec(line);
    if (match === null) { return line; }
    var authorName = match[1];
    var developer = developerInfo.find(authorName);
    return line.replace(authorName, developer.name);
  };

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
      {cwd: rootDir})
    .pipe(new LineStream({ keepEmptyLines: true }))
    .pipe(map(function(chunk) {
      return normaliseCommitAuthorData(decoder.write(chunk)) + "\n";
    }));
  };

  this.commitMessagesStream = function(timePeriod) {
    logger.info('Fetching git messages ', 'from ' + timePeriod.startDate + ' to ' + timePeriod.endDate);
    return command.stream('git',
      GIT_COMMANDS_ARGS.gitlog_messages
      .concat(['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate]),
      {cwd: rootDir});
  };
};
