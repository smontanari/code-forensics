var repositoryHelper = require('./helpers/repository_helper'),
    codeMaat         = require('../analysers/code_maat'),
    utils            = require('../utils'),
    appConfig        = require('../runtime/app_config');

module.exports = function(context, taskDef) {
  taskDef.add('sum-of-coupling-analysis', 'Compute the sum of coupling for each file\nUsage: gulp sum-coupling-analysis [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.sumCouplingAnalyser.fileAnalysisStream(context.files.temp.vcslog(context.dateRange), ['-i', '5'])
    .pipe(repositoryHelper.validPathFilter(context.repository))
    .pipe(utils.json.objectArrayToFileStream(context.files.output.sumOfCoupling()))
    .on("close", function() {
      utils.messages.logGraphUrl(appConfig.serverPort, { graphType: 'sum-of-coupling', timePeriod: context.dateRange.toString() });
    });
  });
};
