var fs         = require('fs'),
    utils      = require('../utils'),
    vcsSupport = require('../vcs_support'),
    pp         = require('../parallel_processing');

module.exports = function(taskDef, context, helpers) {
  var vcsAdapter = vcsSupport.adapter(context.repository.rootPath);

  var runVcsTask = function(fileType, adapterMethod) {
    return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
      if (!utils.fileSystem.isFile(helpers.files[fileType](period))) {
        return vcsAdapter[adapterMethod](period)
        .pipe(fs.createWriteStream(helpers.files[fileType](period)));
      }
    }));
  };

  taskDef.add('vcs-log-dump', function() {
    return runVcsTask('vcslog', 'logStream');
  });

  taskDef.add('vcs-commit-messages', function() {
    return runVcsTask('vcsCommitMessages', 'commitMessagesStream');
  });
};
