var _                    = require('lodash'),
    multistream          = require('multistream'),
    escomplex            = require('../../analysers/escomplex'),
    utils                = require('../../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('javascript-complexity-analysis', 'Report the computed complexity for each javascript file', function() {
    var stream = multistream.obj(_.map(context.repository.sourceFiles('javascript'), function(file) {
      return escomplex.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }));

    return utils.json.objectArrayToFileStream(helpers.files.codeComplexity('javascript'), stream);
  });

  taskDef.add('javascript-complexity-trend-analysis', 'Analyse the complexity trend in time for a particular javascript file\nUsage: javascript-complexity-trend-analysis --targetFile <file> [--dateFrom <date> --dateTo <date>]', function() {
    return helpers.report.publish('complexity-trend', function(publisher) {
      var stream = helpers.revisionStream
        .revisionAnalysisStream(context.parameters.targetFile, context.dateRange, function() {
          return escomplex.analyser.sourceAnalysisStream(context.parameters.targetFile);
        });

      return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
    });
  });
};
