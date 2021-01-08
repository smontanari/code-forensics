/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _              = require('lodash'),
    fs             = require('fs'),
    Path           = require('path'),
    logger         = require('../log'),
    utils          = require('../utils'),
    vcs            = require('../vcs'),
    pp             = require('../parallel_processing'),
    CFRuntimeError = require('../runtime/errors').CFRuntimeError;

module.exports = function(taskDef, context, helpers) {
  var vcsClient = vcs.client(context.repository);
  var vcsLogTransformer = vcs.logTransformer(context.repository, context.developersInfo);

  var createLogFiles = function(fileType, adapterMethod) {
    var logItems = _.chain(context.timePeriods)
      .map(function(period) { return { timePeriod: period, file: helpers.files[fileType](period) }; })
      .filter(function(item) { return context.parameters.updateLogs || !utils.fileSystem.isFile(item.file); })
      .value();

    return pp.streamProcessor().processAll(logItems, function(item) {
      return vcsClient[adapterMethod](item.timePeriod)
        .pipe(fs.createWriteStream(item.file));
    }).then(function() {
      _.each(logItems, function(item) { logger.info('Created: ', Path.basename(item.file)); });
      return logItems;
    });
  };

  var normaliseLogFiles = function(logItems) {
    var transformLogItems = _.map(logItems, function(item) {
      return { source: item.file, target: helpers.files.vcsNormalisedLog(item.timePeriod) };
    });
    var commitDataCaptured = false;
    return pp.streamProcessor().processAll(transformLogItems, function(item) {
      return vcsLogTransformer
        .normaliseLogStream(
          fs.createReadStream(item.source),
          function(validPath) {
            commitDataCaptured = commitDataCaptured || validPath;
          }
        )
        .pipe(fs.createWriteStream(item.target));
    }).then(function() {
      _.each(transformLogItems, function(item) { logger.info('Created: ', Path.basename(item.target)); });
      if (transformLogItems.length > 0 && !commitDataCaptured) {
        logger.error('No relevant commit information was captured in the vcs logs');
        throw new CFRuntimeError('No commit data available for the analysis');
      }
    });
  };

  var vcsLogDump = function() {
    return createLogFiles('vcslog', 'logStream').then(function(logItems) {
      return normaliseLogFiles(logItems);
    });
  };

  var vcsCommitMessages = function() {
    return createLogFiles('vcsCommitMessages', 'commitMessagesStream');
  };

  return {
    functions: {
      vcsLogDump:        vcsLogDump,
      vcsCommitMessages: vcsCommitMessages
    },
    tasks: function() {
      var taskInfo = { parameters: [
        { name: 'dateFrom' },
        { name: 'dateTo' },
        { name: 'timeSplit' },
        { name: 'updateLogs', isFlag: true }
      ] };

      taskDef.addTask('vcs-log-dump', taskInfo, vcsLogDump);

      taskDef.addTask('vcs-commit-messages', taskInfo, vcsCommitMessages);
    }
  };
};
