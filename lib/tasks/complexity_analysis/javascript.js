var _           = require('lodash'),
    multistream = require('multistream'),
    escomplex   = require('../../analysers/escomplex'),
    utils       = require('../../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('javascript-complexity-analysis', function() {
    var stream = multistream.obj(_.map(context.repository.sourceFiles('javascript'), function(file) {
      return escomplex.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }));

    return utils.json.objectArrayToFileStream(helpers.files.codeComplexity('javascript'), stream);
  });

  taskDef.addAnalysisTask('javascript-complexity-trend-analysis',
    {
      description: 'Analyse the complexity trend in time for a particular javascript file',
      parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }],
      reportFile: 'complexity-trend-data.json'
    }, function(publisher) {
    var stream = helpers.revision.revisionComplexityStream(escomplex.analyser);
    return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
  });
};
