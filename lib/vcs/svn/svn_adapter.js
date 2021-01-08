/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var PassThrough   = require('stream').PassThrough,
    _             = require('lodash'),
    StringDecoder = require('string_decoder').StringDecoder,
    XmlReader     = require('xml-reader'),
    logger        = require('../../log'),
    XmlUtils      = require('../../utils').XmlUtils,
    command       = require('../../command');

var SVN_COMMANDS_ARGS = {
  svnlog: ['log', '-v', '--xml'],
  svnInfoRelativeUrl: ['info', '--show-item', 'relative-url'],
  svn_cat: ['cat', '-r']
};

command.Command.definitions.addDefinition('svn', {
  cmd: 'svn',
  args: [],
  installCheck: function() {
    this.verifyExecutable('svn', 'Cannot find the svn commmand.');
  }
});

module.exports = function(repository) {
  var rootDir = repository.rootPath;
  command.Command.ensure('svn');

  var decoder = new StringDecoder();

  var timePeriodArguments = function(timePeriod) {
    var isoPeriod = timePeriod.toISOFormat();
    return ['-r{' + isoPeriod.startDate + '}:{' + isoPeriod.endDate + '}'];
  };

  var logMessageWithTimePeriod = function(msg, timePeriod) {
    var displayPeriod = timePeriod.toDisplayFormat();
    logger.info(msg, ' from ' + displayPeriod.startDate + ' to ' + displayPeriod.endDate);
  };

  var execSvnLog = function(cmd, timePeriod, args) {
    return command[cmd]('svn',
      SVN_COMMANDS_ARGS.svnlog
      .concat(timePeriodArguments(timePeriod))
      .concat(args || []),
      { cwd: rootDir });
  };

  this.vcsRelativePath = function() {
    var svnOutput = command.run('svn',
      SVN_COMMANDS_ARGS.svnInfoRelativeUrl,
      { cwd: rootDir });

    return decoder.write(svnOutput);
  };

  this.revisions = function(filepath, timePeriod) {
    var svnOutput = execSvnLog('run', timePeriod, [filepath]);
    var rootNode = XmlReader.parseSync(decoder.write(svnOutput).trim());
    var logEntries = _.filter(rootNode.children, XmlUtils.nodeWithName('logentry'));

    return logEntries.map(function(entry) {
      var dateElement = _.find(entry.children, XmlUtils.nodeWithName('date'));
      return { revisionId: entry.attributes.revision, date: XmlUtils.nodeText(dateElement) };
    });
  };

  this.showRevisionStream = function(revisionId, filepath) {
    logger.info('Fetching svn revision ', revisionId);
    return command.stream('svn',
      SVN_COMMANDS_ARGS.svn_cat.concat([revisionId, filepath]),
      { cwd: rootDir });
  };

  this.logStream = function(timePeriod) {
    logMessageWithTimePeriod('Fetching svn log', timePeriod);
    return execSvnLog('stream', timePeriod);
  };

  this.commitMessagesStream = function(timePeriod) {
    logMessageWithTimePeriod('Fetching svn messages', timePeriod);

    return _.tap(new PassThrough(), function(collectorStream) {
      var reader = XmlReader.create({ stream: true });
      var parseCompleted = false;

      reader.on('tag:msg', function(data) { collectorStream.push(XmlUtils.nodeText(data) + '\n'); });
      reader.on('done', function() { parseCompleted = true; collectorStream.end(); });
      execSvnLog('stream', timePeriod)
        .on('data', function(chunk) { reader.parse(decoder.write(chunk)); })
        .on('end', function() {
          if (!parseCompleted) {
            collectorStream.emit('error', 'Reached end of stream before xml parsing was completed.');
          }
          collectorStream.end();
        });
    });
  };
};
