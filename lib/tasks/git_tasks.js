var fs         = require('fs'),
    utils      = require('../utils'),
    vcsSupport = require('../vcs_support'),
    pp         = require('../parallel_processing');

module.exports = function(taskDef, context, helpers) {
  var vcsAdapter = vcsSupport.adapter(context.repository.root);

  taskDef.add('vcs-log-dump', 'Retrieve stats from vcs log entries\nUsage: gulp vcs-log-dump [--dateFrom <date> --dateTo <date>]', function() {
    return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
      if (!utils.fileSystem.isFile(helpers.filesHelper.vcslog(period))) {
        return vcsAdapter.logStream(period)
        .pipe(fs.createWriteStream(helpers.filesHelper.vcslog(period)));
      }
    }));
  });

  taskDef.add('vcs-log-messages', 'Retrieve commit messages from vcs log entries\nUsage: gulp vcs-log-messages [--dateFrom <date> --dateTo <date>]', function() {
    return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
      if (!utils.fileSystem.isFile(helpers.filesHelper.vcslogMessages(period))) {
        return vcsAdapter.commitMessagesStream(period)
        .pipe(fs.createWriteStream(helpers.filesHelper.vcslogMessages(period)));
      }
    }));
  });
};
