var _           = require('lodash'),
    multistream = require('multistream'),
    RevisionStreamHelper = require('../helpers/revision_stream_helper'),
    escomplex   = require('../../analysers/escomplex'),
    utils            = require('../../utils');

module.exports = function(context, taskDef) {
  taskDef.add('javascript-complexity-analysis', 'Report the computed complexity for each javascript file', function() {
    return multistream.obj(_.map(context.repository.collectCodePaths('javascript'), function(filepath) {
      return escomplex.analyser.fileAnalysisStream(filepath);
    }))
    .pipe(json.objectArrayToFileStream(context.files.temp.codeComplexity('javascript')));
  });

  taskDef.add('javascript-complexity-trend-analysis', 'Analyse the complexity trend in time for a particular file\nUsage: javascript-complexity-trend-analysis --targetFile <file> [--dateFrom <date> --dateTo <date>]', function() {
    var helper = new RevisionStreamHelper(context.repository, context.jobRunner);
    var outStream = helper.revisionAnalysisStream(context.targetFile, context.dateRange, function() {
      return escomplex.analyser.sourceAnalysisStream(context.targetFile);
    }).pipe(utils.json.objectArrayToFileStream(context.files.output.moduleComplexityTrend(context.targetFile)));

    outStream.on("close", function() {
      utils.messages.logGraphUrl(appConfig.serverPort, { graphType: 'complexity-trend', modulePath: context.targetFile });
    });
    return outStream;
  });
};
