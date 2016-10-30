var _     = require('lodash'),
    flog  = require('../../analysers/flog'),
    pp    = require('../../parallel_processing'),
    utils = require('../../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.addTask('ruby-complexity-analysis', function() {
    var stream = pp.objectStreamCollector()
    .mergeAll(utils.arrays.arrayToFnFactory(context.repository.sourceFiles('ruby'), function(file) {
      return flog.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }));

    return utils.json.objectArrayToFileStream(helpers.files.codeComplexity('ruby'), stream);
  });

  taskDef.addAnalysisTask('ruby-complexity-trend-analysis',
    {
      description: 'Analyse the complexity trend in time for a particular ruby file',
      parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }],
      reportFile: 'complexity-trend-data.json'
    }, function(publisher) {
    var stream = helpers.revision.revisionComplexityStream(flog.analyser);
    return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
  });
};
