/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

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

  var publishHotspotReport = function(publisher) {
    publisher.enableDiagram('sloc');
    var revisionsReport = createDataSource(helpers.files.revisions(), 'revisions');

    var availableComplexityReports = _.filter(
      _.map(context.languages, helpers.files.codeComplexity),
      utils.fileSystem.isFile
    );

    var codeComplexityReports = _.map(availableComplexityReports, function(file) {
      return createDataSource(file, 'totalComplexity');
    });

    if (!_.isEmpty(codeComplexityReports)) {
      publisher.enableDiagram('complexity');
    }

    return new reporting.ReportComposer(helpers.files.sloc())
      .mergeAll([revisionsReport].concat(codeComplexityReports))
      .buildReport().then(function(reportData) {
        var dataTree = helpers.graphData.weightedTree(reportData, 'path', 'revisions');
        return utils.json.objectToFile(publisher.addReportFile(), dataTree);
      });
  };

  taskDef.addAnalysisTask('hotspot-analysis', {
    description: 'Analyse the complexity and churn of source code to identify hotspots',
    parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }],
    reportFile: 'revisions-hotspot-data.json'
  }, ['code-stats-reports', 'revisions-report'], publishHotspotReport);
};
