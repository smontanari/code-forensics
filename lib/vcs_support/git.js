var _             = require('lodash'),
    csvString     = require('csv-string'),
    chalk         = require('chalk'),
    StringDecoder = require('string_decoder').StringDecoder,
    utils         = require('../utils'),
    command       = require('../command');

_.each({
  gitlog_analysis: {
    cmd: 'git',
    args: ['log', '--all', '-M', '-C', '--numstat', '--date=short', '--no-renames', '--pretty=format:--%h--%ad--%an']
  },
  gitlog_messages: {
    cmd: 'git',
    args: ['log', '--date=short', '--pretty=format:%s']
  },
  gitlog_revisions: {
    cmd: 'git',
    args: ['log', '--date=iso', '--pretty=format:%h,%ad']
  },
  git_show: { cmd: 'git', args: ['show'] },
}, function(def, name) {
  command.Command.definitions.addDefinition(name, def);
});

module.exports = function(rootDir) {
  var decoder = new StringDecoder();

  this.revisions = function(filepath, timePeriod) {
    var revisionObjects = [];
    var gitOutput = command.run('gitlog_revisions',
      ['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate].concat([filepath]),
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
    return command.stream('git_show', [revisionId + ":" + filepath], {cwd: rootDir});
  };

  this.logStream = function(timePeriod) {
    utils.log(chalk.yellow("Fetching git log ") + chalk.grey("from " + timePeriod.startDate + " to " + timePeriod.endDate));
    return command.stream('gitlog_analysis', ['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate], {cwd: rootDir});
  };

  this.commitMessagesStream = function(timePeriod) {
    utils.log(chalk.yellow("Fetching git messages ") + chalk.grey("from " + timePeriod.startDate + " to " + timePeriod.endDate));
    return command.stream('gitlog_messages', ['--after=' + timePeriod.startDate, '--before=' + timePeriod.endDate], {cwd: rootDir});
  };
};
