var fs      = require('fs'),
    _       = require('lodash'),
    fnUtils = require('../utils').functions,
    Git     = require('../vcs_support').Git,
    pp      = require('../parallel_processing');

module.exports = function(context, taskDef) {
  var gitRepo = new Git(context.repository.root);
  taskDef.add('git-log-dump', 'Retrieve stats from git log entries\nUsage: gulp git-log-dump [--dateFrom <date> --dateTo <date>]', function(cb) {
    return pp.taskExecutor(context.jobRunner).processAll(fnUtils.arrayToFnFactory(context.timePeriods, function(period) {
      try { fs.statSync(context.files.temp.gitlog(period)) }
      catch(e) {
        return gitRepo.logStream(period)
        .pipe(fs.createWriteStream(context.files.temp.gitlog(period)));
      }
    }));
  });

  taskDef.add('git-log-messages', 'Retrieve commit messages from git log entries\nUsage: gulp git-log-messages [--dateFrom <date> --dateTo <date>]', function() {
    return pp.taskExecutor(context.jobRunner).processAll(fnUtils.arrayToFnFactory(context.timePeriods, function(period) {
      try { fs.statSync(context.files.temp.gitlogMessages(period)) }
      catch(e) {
        return gitRepo.commitMessagesStream(period)
        .pipe(fs.createWriteStream(context.files.temp.gitlogMessages(period)));
      }
    }));
  });
};
