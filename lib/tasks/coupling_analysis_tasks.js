var _               = require('lodash'),
    filter          = require('through2-filter'),
    pp              = require('../parallel_processing'),
    codeMaat        = require('../analysers/code_maat'),
    reporting       = require('../reporting'),
    utils           = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('sum-of-coupling-analysis', 'Compute the sum of coupling for each file\nUsage: gulp sum-coupling-analysis [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return helpers.reportHelper.publish('sum-of-coupling', function(publisher) {
      return codeMaat.sumCouplingAnalyser.fileAnalysisStream(context.files.temp.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
      .pipe(utils.json.objectArrayToFileStream(publisher.addReportFile()));
    });
  });

  taskDef.add('temporal-coupling-analysis', 'Analyse the evolution of coupling in time for a particular file\nUsage: temporal-coupling-analysis --targetFile <file> [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-log-dump', 'sloc-analysis'], function() {
    return helpers.reportHelper.publish('temporal-coupling', function(publisher) {
      return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
        var tcAnalysis = codeMaat.temporalCouplingAnalyser
          .fileAnalysisStream(context.files.temp.vcslog(period))
          .pipe(filter.obj(_.partial(utils.pathMatchers.isCoupledWith, context.targetFile)));
        return new reporting.ReportComposer(context.files.temp.sloc())
          .mergeWith(tcAnalysis, {
            matchStrategy: _.partial(utils.pathMatchers.areCoupledWith, context.targetFile),
            mergeStrategy: reporting.MergeStrategies.extension('couplingDegree')
          })
          .buildReport().then(function(reportData) {
            var dataTree = helpers.graphDataHelper.weightedTree(reportData, 'path', 'couplingDegree');
            utils.json.objectToFile(publisher.addReportFile(period), dataTree);
          });
      }));
    });
  });
};
