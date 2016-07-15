var _ = require('lodash'),
    repositoryHelper = require('./helpers/repository_helper'),
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

  taskDef.add('temporal-coupling-analysis', 'Analyse the evolution of coupling in time for a particular file\nUsage: temporal-coupling-analysis --targetFile <file> [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-log-dump', 'sloc-analysis'], function() {
    var reporting = require ('../reporting');
    var graphSupport = require ('../graph_support');
    var map = require("through2-map");
    var filter = require("through2-filter");
    var arrayToStream = require('stream-array');
    var pp         = require('../parallel_processing');
    var matchFn = function(dataItem, reportItem) {
      return (reportItem.path.match(dataItem.coupledPath) && context.targetFile === dataItem.path) ||
             (reportItem.path.match(dataItem.path) && context.targetFile === dataItem.coupledPath);
    };
    return pp.taskExecutor().processAll(utils.functions.arrayToFnFactory(context.timePeriods, function(period) {
      var tcAnalysis = codeMaat.temporalCouplingAnalyser
        .fileAnalysisStream(context.files.temp.vcslog(period), ['-i', '5', '-n', '1', '-m', '1'])
        .pipe(filter.obj(function(item) { return item.path === context.targetFile || item.coupledPath === context.targetFile; }));
      return new reporting.ReportComposer(context.files.temp.sloc())
        .mergeWith(tcAnalysis, matchFn, 'couplingDegree')
        .buildReport()
        .then(function(reportData) {
          var dataTree = _.tap(new graphSupport.WeightedTree(null, 'path', { weightedProperty: 'couplingDegree', normalised: true }), function(tree) {
            _.each(reportData, tree.withItem.bind(tree));
          }).rootNode();
          utils.json.objectToFile(context.files.output.temporalCoupling(period, context.targetFile), dataTree);
        })
    }))
    .then(function() {
      utils.messages.logGraphUrl(appConfig.serverPort, { graphType: 'temporal-coupling', modulePath: context.targetFile, dateRange: _.map(context.timePeriods, function(p) { return p.toString(); }) })
    });
  });
};
