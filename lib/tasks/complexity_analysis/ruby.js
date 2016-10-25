var _     = require('lodash'),
    flog  = require('../../analysers/flog'),
    pp    = require('../../parallel_processing'),
    utils = require('../../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('ruby-complexity-analysis', 'Report the computed complexity for each ruby file', function() {
    var stream = pp.objectStreamCollector()
    .mergeAll(utils.arrays.arrayToFnFactory(context.repository.sourceFiles('ruby'), function(file) {
      return flog.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }));

    return utils.json.objectArrayToFileStream(helpers.files.codeComplexity('ruby'), stream);
  });

  taskDef.add('ruby-complexity-trend-analysis', 'Analyse the complexity trend in time for a particular ruby file\nUsage: ruby-complexity-trend-analysis --targetFile <file> [--dateFrom <date> --dateTo <date>]', function() {
    return helpers.report.publish('complexity-trend', function(publisher) {
      var stream = helpers.revision.revisionComplexityStream(flog.analyser);
      return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
    });
  });
};
