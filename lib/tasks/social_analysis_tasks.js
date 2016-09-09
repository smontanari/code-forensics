var fs           = require('fs'),
    filter       = require('through2-filter'),
    pp           = require('../parallel_processing'),
    wordCount    = require('../analysers/word_count'),
    codeMaat     = require('../analysers/code_maat'),
    utils        = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('commit-cloud', 'Generate a word-cloud of commit messages\nUsage: commit-cloud [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-log-messages'], function() {
    return helpers.reportHelper.publish('commit-word-cloud', function(publisher) {
      return pp.taskExecutor().processAll(utils.functions.arrayToFnFactory(context.timePeriods, function(timePeriod) {
        return fs.createReadStream(context.files.temp.vcslogMessages(timePeriod))
          .pipe(wordCount.analyser.textAnalysisStream(context.commitCloudFilters))
          .pipe(utils.json.objectToFileStream(publisher.addReportFile(timePeriod)));
      }));
    });
  });

  taskDef.add('authors-analysis', '\nUsage: authors-analysis  [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return helpers.reportHelper.publish('authors-frequency', function(publisher) {
      return codeMaat.authorsAnalyser
        .fileAnalysisStream(context.files.temp.vcslog(context.dateRange), ['-i', '5', '-n', '1', '-m', '1'])
        .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
        .pipe(utils.json.objectArrayToFileStream(publisher.addReportFile()));
    });
  });
};
