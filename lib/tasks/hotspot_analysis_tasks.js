var fs               = require('fs'),
    _                = require('lodash'),
    codeMaat         = require('../analysers/code_maat'),
    utils            = require('../utils');
    repositoryHelper = require('./helpers/repository_helper'),
    graphDataHelper  = require('./helpers/graph_data_helper'),
    reportHelper     = require('./helpers/report_helper');

module.exports = function(context, taskDef) {
  taskDef.add('revisions-analysis', 'Report on the number of git revisions for each file\nUsage: gulp revisions-analysis [--dateFrom <date> --dateTo <date>]', ['git-log-dump'], function() {
    return codeMaat.revisionsAnalyser.gitlogFileAnalysisStream(context.files.temp.gitlog(context.dateRange))
    .pipe(repositoryHelper.absolutePathMapper(context.repository))
    .pipe(repositoryHelper.validPathFilter(context.repository))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.revisions()));
  });

  taskDef.add('hotspot-analysis-report', 'Build a report combining code and revision analysis', function() {
    var codeComplexityFiles = _.filter(_.map(context.languages, context.files.temp.codeComplexity), utils.fileSystem.isFile);
    return reportHelper.hotspotAnalysis(
      context.files.temp.sloc(),
      context.files.temp.revisions(),
      codeComplexityFiles
    ).then(function(reportData) {
      var dataTree = graphDataHelper.hotspotDataTree(context.repository, reportData);
      fs.writeFile(context.files.output.revisionsHotspot(), JSON.stringify(dataTree, null, 2));
      utils.messages.logGraphUrl({ graphType: 'hotspot-analysis' });
    });
  });

  taskDef.add('hotspot-analysis', 'Perform a code hotspot detection combining code and revision analysis\nUsage: gulp hotspot-analysis [--dateFrom <date> --dateTo <date>]', ['code-analysis', 'revisions-analysis', 'hotspot-analysis-report']);
};
