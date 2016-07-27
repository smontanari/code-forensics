var _                    = require('lodash'),
    multistream          = require('multistream'),
    escomplex            = require('../../analysers/escomplex'),
    repositoryHelper     = require('../helpers/repository_helper'),
    RevisionStreamHelper = require('../helpers/revision_stream_helper'),
    reporting            = require('../../reporting'),
    utils                = require('../../utils'),
    appConfig            = require('../../runtime/app_config');

module.exports = function(context, taskDef) {
  taskDef.add('javascript-complexity-analysis', 'Report the computed complexity for each javascript file', function() {
    return multistream.obj(_.map(repositoryHelper.codeFiles(context.repository, 'javascript'), function(file) {
      return escomplex.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.codeComplexity('javascript')));
  });

  taskDef.add('javascript-complexity-trend-analysis', 'Analyse the complexity trend in time for a particular javascript file\nUsage: javascript-complexity-trend-analysis --targetFile <file> [--dateFrom <date> --dateTo <date>]', function() {
    var publisher = new reporting.Publisher('complexity-trend-report', context);
    return new RevisionStreamHelper(context.repository.root)
    .revisionAnalysisStream(context.targetFile, context.dateRange, function() {
      return escomplex.analyser.sourceAnalysisStream(context.targetFile);
    })
    .pipe(utils.json.objectArrayToFileStream(publisher.addReportFile()))
    .on("close", function() {
      publisher.createManifest();
    });
  });
};
