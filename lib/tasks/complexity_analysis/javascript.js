var _                    = require('lodash'),
    multistream          = require('multistream'),
    escomplex            = require('../../analysers/escomplex'),
    RevisionStreamHelper = require('../helpers/revision_stream_helper'),
    ReportHelper         = require('../helpers/report_helper'),
    utils                = require('../../utils');

module.exports = function(context, taskDef) {
  var reportHelper = new ReportHelper(context);

  taskDef.add('javascript-complexity-analysis', 'Report the computed complexity for each javascript file', function() {
    return multistream.obj(_.map(context.repository.sourceFiles('javascript'), function(file) {
      return escomplex.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.codeComplexity('javascript')));
  });

  taskDef.add('javascript-complexity-trend-analysis', 'Analyse the complexity trend in time for a particular javascript file\nUsage: javascript-complexity-trend-analysis --targetFile <file> [--dateFrom <date> --dateTo <date>]', function() {
    return reportHelper.publish('complexity-trend', function(publisher) {
      return new RevisionStreamHelper(context.repository.root)
      .revisionAnalysisStream(context.targetFile, context.dateRange, function() {
        return escomplex.analyser.sourceAnalysisStream(context.targetFile);
      })
      .pipe(utils.json.objectArrayToFileStream(publisher.addReportFile()));
    });
  });
};
