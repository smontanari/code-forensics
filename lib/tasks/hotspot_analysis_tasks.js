var _         = require('lodash'),
    filter    = require('through2-filter'),
    reporting = require('../reporting'),
    codeMaat  = require('../analysers/code_maat'),
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('revisions-analysis', 'Report on the number of vcs revisions for each file\nUsage: gulp revisions-analysis [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.revisionsAnalyser.fileAnalysisStream(context.files.temp.vcslog(context.dateRange))
    .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.revisions()));
  });

  var produceHotspotReport = function() {
    var dataSources = [
      reporting.ReportComposer.newDataSource(context.files.temp.revisions(), {
        matchStrategy: utils.pathMatchers.haveSamePath,
        mergeStrategy: reporting.MergeStrategies.extension('revisions')
      })
    ].concat(_.map(_.filter(
      _.map(context.languages, context.files.temp.codeComplexity),
      utils.fileSystem.isFile
    ), function(file) {
      return reporting.ReportComposer.newDataSource(file,
        { matchStrategy: utils.pathMatchers.haveSamePath,
          mergeStrategy: reporting.MergeStrategies.extension('totalComplexity')
        });
    }));

    return helpers.reportHelper.publish('hotspot-analysis', function(publisher) {
      return new reporting.ReportComposer(context.files.temp.sloc())
        .mergeAll(dataSources)
        .buildReport().then(function(reportData) {
          var dataTree = helpers.graphDataHelper.weightedTree(reportData, 'path', 'revisions');
          utils.json.objectToFile(publisher.addReportFile(), dataTree);
        });
    });
  };

  taskDef.add('hotspot-analysis-report', 'Build a report combining code and revision analysis', produceHotspotReport);

  taskDef.add('hotspot-analysis', 'Perform a code hotspot detection combining code and revision analysis\nUsage: gulp hotspot-analysis [--dateFrom <date> --dateTo <date>]', ['code-analysis', 'revisions-analysis'], produceHotspotReport);
};
