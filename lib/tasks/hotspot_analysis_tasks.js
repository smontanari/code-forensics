var _         = require('lodash'),
    reporting = require('../reporting'),
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  var createDataSource = function(file, mergeProperty) {
    return reporting.ReportComposer.newDataSource(file,
      {
        matchStrategy: utils.pathMatchers.haveSamePath,
        mergeStrategy: reporting.MergeStrategies.extension(mergeProperty)
      }
    );
  };

  var publishHotspotReport = function() {
    var revisionsReport = createDataSource(helpers.files.revisions(), 'revisions');

    var availableComplexityReports = _.filter(
      _.map(context.languages, helpers.files.codeComplexity),
      utils.fileSystem.isFile
    );

    var codeComplexityReports = _.map(availableComplexityReports, function(file) {
      return createDataSource(file, 'totalComplexity');
    });

    return helpers.report.publish('hotspot-analysis', function(publisher) {
      return new reporting.ReportComposer(helpers.files.sloc())
        .mergeAll([revisionsReport].concat(codeComplexityReports))
        .buildReport().then(function(reportData) {
          var dataTree = helpers.graphData.weightedTree(reportData, 'path', 'revisions');
          return utils.json.objectToFile(publisher.addReportFile(), dataTree);
        });
    });
  };

  taskDef.add('hotspot-report', publishHotspotReport);

  taskDef.add('hotspot-analysis', {
    description: 'Perform a code hotspot detection combining code and revision analysis',
    parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }]
  }, ['code-analysis', 'revisions-report'], publishHotspotReport);
};
