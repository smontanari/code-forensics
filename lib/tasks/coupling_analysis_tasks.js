var _         = require('lodash'),
    filter    = require('through2-filter'),
    pp        = require('../parallel_processing'),
    codeMaat  = require('../analysers/code_maat'),
    reporting = require('../reporting'),
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.addAnalysisTask('sum-of-coupling-analysis',
    {
      description: 'Analyse the sum of coupling for each file',
      reportName: 'sum-of-coupling',
      parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }],
      reportFile: 'sum-of-coupling-data.json'
    }, ['vcs-log-dump'], function(publisher) {
      var stream = codeMaat.sumCouplingAnalyser().fileAnalysisStream(helpers.files.vcslog(context.dateRange))
        .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));
      return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
  });

  taskDef.addAnalysisTask('temporal-coupling-analysis',
    {
      description: 'Analyse the evolution of coupling in time for a particular file',
      reportName: 'temporal-coupling',
      parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }, { name: 'frequency' }],
      reportFile: 'temporal-coupling-data.json'
    }, ['vcs-log-dump', 'sloc-report'], function(publisher) {
      return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
        var tcAnalysis = codeMaat.temporalCouplingAnalyser()
          .fileAnalysisStream(helpers.files.vcslog(period))
          .pipe(filter.obj(_.partial(utils.pathMatchers.isCoupledWith, context.parameters.targetFile)));
        return new reporting.ReportComposer(helpers.files.sloc())
          .mergeWith(tcAnalysis, {
            matchStrategy: _.partial(utils.pathMatchers.areCoupledWith, context.parameters.targetFile),
            mergeStrategy: reporting.MergeStrategies.extension(['couplingDegree', 'revisionsAvg'])
          })
          .buildReport().then(function(reportData) {
            var dataTree = helpers.graphData.weightedTree(reportData, 'path', 'couplingDegree');
            return utils.json.objectToFile(publisher.addReportFile(period), dataTree);
          });
    }));
  });
};
