var _                = require('lodash'),
    repositoryHelper = require('./helpers/repository_helper'),
    graphDataHelper  = require('./helpers/graph_data_helper'),
    reportHelper     = require('./helpers/report_helper'),
    codeMaat         = require('../analysers/code_maat'),
    utils            = require('../utils'),
    appConfig        = require('../runtime/app_config');

module.exports = function(context, taskDef) {
  var createHotspotReport = function() {
    var codeComplexityFiles = _.filter(_.map(context.languages, context.files.temp.codeComplexity), utils.fileSystem.isFile);
    return reportHelper.hotspotAnalysis(
      context.files.temp.sloc(),
      context.files.temp.revisions(),
      codeComplexityFiles
    ).then(function(reportData) {
      var dataTree = graphDataHelper.hotspotDataTree(context.repository, reportData);
      utils.json.objectToFile(context.files.output.revisionsHotspot(), dataTree);
      utils.messages.logGraphUrl(appConfig.serverPort, { graphType: 'hotspot-analysis' });
    });
  };

  taskDef.add('revisions-analysis', 'Report on the number of git revisions for each file\nUsage: gulp revisions-analysis [--dateFrom <date> --dateTo <date>]', ['git-log-dump'], function() {
    return codeMaat.revisionsAnalyser.gitlogFileAnalysisStream(context.files.temp.gitlog(context.dateRange))
    .pipe(repositoryHelper.absolutePathMapper(context.repository))
    .pipe(repositoryHelper.validPathFilter(context.repository))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.revisions()));
  });

  taskDef.add('hotspot-analysis-report', 'Build a report combining code and revision analysis', createHotspotReport);
  taskDef.add('hotspot-analysis', 'Perform a code hotspot detection combining code and revision analysis\nUsage: gulp hotspot-analysis [--dateFrom <date> --dateTo <date>]', ['code-analysis', 'revisions-analysis'], createHotspotReport);
};
