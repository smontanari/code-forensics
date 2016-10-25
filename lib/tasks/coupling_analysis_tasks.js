var _         = require('lodash'),
    filter    = require('through2-filter'),
    pp        = require('../parallel_processing'),
    codeMaat  = require('../analysers/code_maat'),
    reporting = require('../reporting'),
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('sum-of-coupling-analysis', 'Report the sum of coupling for each file\nUsage: gulp sum-coupling-analysis [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return helpers.report.publish('sum-of-coupling', function(publisher) {
      var stream = codeMaat.sumCouplingAnalyser.fileAnalysisStream(helpers.files.vcslog(context.dateRange))
        .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));
      return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
    });
  });

  taskDef.add('temporal-coupling-analysis', 'Analyse the evolution of coupling in time for a particular file\nUsage: temporal-coupling-analysis --targetFile <file> [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-log-dump', 'sloc-analysis'], function() {
    return helpers.report.publish('temporal-coupling', function(publisher) {
      return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
        var tcAnalysis = codeMaat.temporalCouplingAnalyser
          .fileAnalysisStream(helpers.files.vcslog(period))
          .pipe(filter.obj(_.partial(utils.pathMatchers.isCoupledWith, context.parameters.targetFile)));
        return new reporting.ReportComposer(helpers.files.sloc())
          .mergeWith(tcAnalysis, {
            matchStrategy: _.partial(utils.pathMatchers.areCoupledWith, context.parameters.targetFile),
            mergeStrategy: reporting.MergeStrategies.extension('couplingDegree')
          })
          .buildReport().then(function(reportData) {
            var dataTree = helpers.graphData.weightedTree(reportData, 'path', 'couplingDegree');
            return utils.json.objectToFile(publisher.addReportFile(period), dataTree);
          });
      }));
    });
  });
};
