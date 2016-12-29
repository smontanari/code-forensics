var _          = require('lodash'),
    fs         = require('fs'),
    Path       = require('path'),
    logger     = require('../log').Logger,
    utils      = require('../utils'),
    vcsSupport = require('../vcs_support'),
    pp         = require('../parallel_processing');

module.exports = function(taskDef, context, helpers) {
  var vcsAdapter = vcsSupport.adapter(context.repository);

  var createLogFiles = function(fileType, adapterMethod) {
    var logItems = _.map(context.timePeriods, function(period) {
      return { timePeriod: period, file: helpers.files[fileType](period) };
    });
    return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(logItems, function(item) {
      if (!utils.fileSystem.isFile(item.file)) {
        return vcsAdapter[adapterMethod](item.timePeriod)
        .pipe(fs.createWriteStream(item.file));
      }
    })).then(function() {
      _.each(logItems, function(item) { logger.info('Created: ', Path.basename(item.file)); });
      return logItems;
    });
  };

  var normaliseLogFiles = function(logItems, transformer) {
    var transformLogItems = _.map(logItems, function(item) {
      return { source: item.file, target: helpers.files.vcsNormalisedLog(item.timePeriod) };
    });
    return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(transformLogItems, function(item) {
      return transformer
        .normaliseLogStream(fs.createReadStream(item.source))
        .pipe(fs.createWriteStream(item.target));
    })).then(function() {
      _.each(transformLogItems, function(item) { logger.info('Created: ', Path.basename(item.target)); });
    });
  };

  var taskInfo = { parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'frequency' }] };

  taskDef.addTask('vcs-log-dump', taskInfo, function() {
    return createLogFiles('vcslog', 'logStream').then(function(logItems) {
      return normaliseLogFiles(logItems, vcsSupport.logStreamTransformer(context.repository, context.developerInfo));
    });
  });

  taskDef.addTask('vcs-commit-messages', taskInfo, function() {
    return createLogFiles('vcsCommitMessages', 'commitMessagesStream');
  });
};
