var fs           = require('fs'),
    pp           = require('../parallel_processing'),
    wordCount    = require('../analysers/word_count'),
    //codeMaat     = require('../analysers/code_maat'),
    utils        = require('../utils'),
    ReportHelper = require('./helpers/report_helper');

module.exports = function(context, taskDef) {
  var reportHelper = new ReportHelper(context);

  taskDef.add('commit-cloud', 'Generate a word-cloud of commit messages\nUsage: commit-cloud [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-log-messages'], function() {
    return reportHelper.publish('commit-word-cloud', function(publisher) {
      return pp.taskExecutor().processAll(utils.functions.arrayToFnFactory(context.timePeriods, function(timePeriod) {
        return fs.createReadStream(context.files.temp.vcslogMessages(timePeriod))
        .pipe(wordCount.analyser.textAnalysisStream(context.commitCloudFilters))
        .pipe(utils.json.objectToFileStream(publisher.addReportFile(timePeriod)));
      }));
    });
  });
};
