var _                = require('lodash'),
    filter           = require('through2-filter'),
    ReportHelper     = require('./helpers/report_helper'),
    graphDataHelper  = require('./helpers/graph_data_helper'),
    reporting        = require('../reporting'),
    codeMaat         = require('../analysers/code_maat'),
    utils            = require('../utils');

module.exports = function(context, taskDef) {
  var reportHelper = new ReportHelper(context);

  taskDef.add('revisions-analysis', 'Report on the number of vcs revisions for each file\nUsage: gulp revisions-analysis [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.revisionsAnalyser.fileAnalysisStream(context.files.temp.vcslog(context.dateRange))
    .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.revisions()));
  });

  var produceHotspotReport = function() {
    return reportHelper.publish('hotspot-analysis', function(publisher) {
      var complexityAnalysisFiles = _.filter(
        _.map(context.languages, context.files.temp.codeComplexity),
        utils.fileSystem.isFile
      );

      return _.tap(new reporting.ReportComposer(context.files.temp.sloc()), function(reportComposer) {
        var matchFn = function(dataItem, reportItem) { return dataItem.path === reportItem.path; };
        reportComposer.mergeWith(context.files.temp.revisions(), matchFn, 'revisions');
        _.each(complexityAnalysisFiles, function(file) {
          reportComposer.mergeWith(file, matchFn, 'totalComplexity');
        });
      }).buildReport().then(function(reportData) {
        var dataTree = graphDataHelper.hotspotDataTree(reportData);
        utils.json.objectToFile(publisher.addReportFile(), dataTree);
      });
    });
  };

  taskDef.add('hotspot-analysis-report', 'Build a report combining code and revision analysis', produceHotspotReport);

  taskDef.add('hotspot-analysis', 'Perform a code hotspot detection combining code and revision analysis\nUsage: gulp hotspot-analysis [--dateFrom <date> --dateTo <date>]', ['code-analysis', 'revisions-analysis'], produceHotspotReport);
};
