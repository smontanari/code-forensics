var _                = require('lodash'),
    repositoryHelper = require('./helpers/repository_helper'),
    graphDataHelper  = require('./helpers/graph_data_helper'),
    reportHelper     = require('./helpers/report_helper'),
    reporting        = require('../reporting'),
    codeMaat         = require('../analysers/code_maat'),
    utils            = require('../utils'),
    appConfig        = require('../runtime/app_config');

module.exports = function(context, taskDef) {
  taskDef.add('revisions-analysis', 'Report on the number of vcs revisions for each file\nUsage: gulp revisions-analysis [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.revisionsAnalyser.fileAnalysisStream(context.files.temp.vcslog(context.dateRange))
    .pipe(repositoryHelper.validPathFilter(context.repository))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.revisions()));
  });

  var produceHotspotReport = function() {
    var publisher = new reporting.Publisher('hotspot-analysis', context);
    var codeComplexityFiles = _.filter(_.map(context.languages, context.files.temp.codeComplexity), utils.fileSystem.isFile);
    return reportHelper.hotspotAnalysis(
      context.files.temp.sloc(),
      context.files.temp.revisions(),
      codeComplexityFiles
    ).then(function(reportData) {
      var dataTree = graphDataHelper.hotspotDataTree(reportData);
      utils.json.objectToFile(publisher.addReportFile(), dataTree);
      publisher.createManifest();
    });
  };
  taskDef.add('hotspot-analysis-report', 'Build a report combining code and revision analysis', produceHotspotReport);

  taskDef.add('hotspot-analysis', 'Perform a code hotspot detection combining code and revision analysis\nUsage: gulp hotspot-analysis [--dateFrom <date> --dateTo <date>]', ['code-analysis', 'revisions-analysis'], function() {
    return produceHotspotReport();
  });
};
