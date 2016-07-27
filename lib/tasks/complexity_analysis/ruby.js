var _                    = require('lodash'),
    flog                 = require('../../analysers/flog'),
    pp                   = require('../../parallel_processing'),
    repositoryHelper     = require('../helpers/repository_helper'),
    RevisionStreamHelper = require('../helpers/revision_stream_helper'),
    reporting            = require('../../reporting'),
    utils                = require('../../utils'),
    appConfig            = require('../../runtime/app_config');

module.exports = function(context, taskDef) {
  taskDef.add('ruby-complexity-analysis', 'Report the computed complexity for each ruby file', function() {
    return pp.objectStreamCollector()
    .mergeAll(utils.functions.arrayToFnFactory(repositoryHelper.codeFiles(context.repository, 'ruby'), function(file) {
      return flog.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.codeComplexity('ruby')));
  });

  taskDef.add('ruby-complexity-trend-analysis', 'Analyse the complexity trend in time for a particular ruby file\nUsage: ruby-complexity-trend-analysis --targetFile <file> [--dateFrom <date> --dateTo <date>]', function() {
    var publisher = new reporting.Publisher('complexity-trend', context);
    return new RevisionStreamHelper(context.repository.root)
    .revisionAnalysisStream(context.targetFile, context.dateRange, function() {
      return flog.analyser.sourceAnalysisStream(context.targetFile);
    })
    .pipe(utils.json.objectArrayToFileStream(publisher.addReportFile()))
    .on("close", function() {
      publisher.createManifest();
    });
  });
};
