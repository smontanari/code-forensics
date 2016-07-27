var _                = require('lodash'),
    repositoryHelper = require('./helpers/repository_helper'),
    codeMaat         = require('../analysers/code_maat'),
    reporting        = require('../reporting'),
    utils            = require('../utils'),
    appConfig        = require('../runtime/app_config');

module.exports = function(context, taskDef) {
  taskDef.add('sum-of-coupling-analysis', 'Compute the sum of coupling for each file\nUsage: gulp sum-coupling-analysis [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    var publisher = new reporting.Publisher('sum-of-coupling', context);
    return codeMaat.sumCouplingAnalyser.fileAnalysisStream(context.files.temp.vcslog(context.dateRange), ['-i', '5'])
    .pipe(repositoryHelper.validPathFilter(context.repository))
    .pipe(utils.json.objectArrayToFileStream(publisher.addReportFile()))
    .on("close", function() {
      publisher.createManifest();
    });
  });

  taskDef.add('temporal-coupling-analysis', 'Analyse the evolution of coupling in time for a particular file\nUsage: temporal-coupling-analysis --targetFile <file> [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-log-dump', 'sloc-analysis'], function() {
    var publisher = new reporting.Publisher('temporal-coupling', context);
    var graphSupport = require ('../graph_support');
    var filter = require("through2-filter");
    // var arrayToStream = require('stream-array');
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
          utils.json.objectToFile(publisher.addReportFile(period), dataTree);
        });
    }))
    .then(function() {
      publisher.createManifest();
    });
  });
};
