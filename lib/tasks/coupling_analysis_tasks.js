var _         = require('lodash'),
    filter    = require('through2-filter'),
    Q         = require('q'),
    pp        = require('../parallel_processing'),
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
      var stream = helpers.codeMaat.sumCouplingAnalysis(helpers.files.vcsNormalisedLog(context.dateRange))
        .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));
      return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
  });

  taskDef.addAnalysisTask('temporal-coupling-analysis',
    {
      description: 'Analyse the evolution of coupling in time for a particular file',
      reportName: 'temporal-coupling',
      parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }, { name: 'timeSplit' }],
      reportFile: 'temporal-coupling-data.json'
    }, ['vcs-log-dump', 'sloc-report'], function(publisher) {
      var tcAnalysis = function(period) {
        return helpers.codeMaat.temporalCouplingAnalysis(helpers.files.vcsNormalisedLog(period))
        .pipe(filter.obj(_.partial(utils.pathMatchers.isCoupledWith, context.parameters.targetFile)));
      };

      var ecAnalysis = function(period) {
        return helpers.codeMaat.entityChurnAnalysis(helpers.files.vcsNormalisedLog(period));
      };

      var allReports = _.map(context.timePeriods, function(period) {
        return pp.objectStreamProcessor().processAll([
          _.wrap(period, tcAnalysis), _.wrap(period, ecAnalysis)
        ]).then(function(streamPromises) {
          if (_.some(streamPromises, { 'state': 'rejected' })) {
            throw new Error(_.map(_.select(streamPromises, { 'state': 'rejected' }), 'reason'));
          }

          return new reporting.ReportComposer(helpers.files.sloc())
            .mergeWith(streamPromises[0].value, {
              matchStrategy: _.partial(utils.pathMatchers.areCoupledWith, context.parameters.targetFile),
              mergeStrategy: reporting.MergeStrategies.extension(['couplingDegree', 'revisionsAvg'])
            })
            .mergeWith(streamPromises[1].value, {
              matchStrategy: utils.pathMatchers.haveSamePath,
              mergeStrategy: reporting.MergeStrategies.extension(['addedLines', 'deletedLines'])
            })
            .buildReport().then(function(reportData) {
              var dataTree = helpers.graphData.weightedTree(reportData, 'path', 'couplingDegree');
              return utils.json.objectToFile(publisher.addReportFile(period), dataTree);
            });
        });
      });

      return Q.all(allReports);
  });
};
