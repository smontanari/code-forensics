var _         = require('lodash'),
    reporting = require ('../../reporting');

module.exports = {
  hotspotAnalysis: function(slocAnalysisFile, revisionsAnalysisFile, complexityAnalysisFiles) {
    return _.tap(new reporting.ReportComposer(slocAnalysisFile), function(reportComposer) {
      var matchFn = function(dataItem, reportItem) { return dataItem.path === reportItem.path; };
      reportComposer.mergeWith(revisionsAnalysisFile, matchFn, 'revisions');
      _.each(complexityAnalysisFiles, function(file) {
        reportComposer.mergeWith(file, matchFn, 'totalComplexity');
      });
    }).buildReport();
  }
};
