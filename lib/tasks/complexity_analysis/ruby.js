var _                    = require('lodash'),
    flog                 = require('../../analysers/flog'),
    pp                   = require('../../parallel_processing'),
    utils                = require('../../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('ruby-complexity-analysis', 'Report the computed complexity for each ruby file', function() {
    return pp.objectStreamCollector()
    .mergeAll(utils.functions.arrayToFnFactory(context.repository.sourceFiles('ruby'), function(file) {
      return flog.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.codeComplexity('ruby')));
  });

  taskDef.add('ruby-complexity-trend-analysis', 'Analyse the complexity trend in time for a particular ruby file\nUsage: ruby-complexity-trend-analysis --targetFile <file> [--dateFrom <date> --dateTo <date>]', function() {
    return helpers.reportHelper.publish('complexity-trend', function(publisher) {
      return helpers.revisionStreamHelper
      .revisionAnalysisStream(context.targetFile, context.dateRange, function() {
        return flog.analyser.sourceAnalysisStream(context.targetFile);
      })
      .pipe(utils.json.objectArrayToFileStream(publisher.addReportFile()));
    });
  });
};
