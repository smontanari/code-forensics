/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _      = require('lodash'),
    fs     = require('fs'),
    Path   = require('path'),
    logger = require('../log').Logger,
    utils  = require('../utils'),
    vcs    = require('../vcs'),
    pp     = require('../parallel_processing');

module.exports = function(taskDef, context, helpers) {
  var vcsClient = vcs.client(context.repository);
  var vcsLogTransformer = vcs.logTransformer(context.repository, context.developersInfo);

  var createLogFiles = function(fileType, adapterMethod) {
    var logItems = _.map(context.timePeriods, function(period) {
      return { timePeriod: period, file: helpers.files[fileType](period) };
    });
    return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(logItems, function(item) {
      if (!utils.fileSystem.isFile(item.file)) {
        return vcsClient[adapterMethod](item.timePeriod)
        .pipe(fs.createWriteStream(item.file));
      }
    })).then(function() {
      _.each(logItems, function(item) { logger.info('Created: ', Path.basename(item.file)); });
      return logItems;
    });
  };

  var normaliseLogFiles = function(logItems) {
    var transformLogItems = _.map(logItems, function(item) {
      return { source: item.file, target: helpers.files.vcsNormalisedLog(item.timePeriod) };
    });
    return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(transformLogItems, function(item) {
      return vcsLogTransformer
        .normaliseLogStream(fs.createReadStream(item.source))
        .pipe(fs.createWriteStream(item.target));
    })).then(function() {
      _.each(transformLogItems, function(item) { logger.info('Created: ', Path.basename(item.target)); });
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
      var taskInfo = { parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'timeSplit' }] };

      taskDef.addTask('vcs-log-dump', taskInfo, vcsLogDump);

      taskDef.addTask('vcs-commit-messages', taskInfo, vcsCommitMessages);
    }
  };
};
