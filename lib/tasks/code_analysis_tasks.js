var _           = require('lodash'),
    multistream = require('multistream'),
    sloc        = require('../analysers/sloc'),
    utils       = require('../utils/');

module.exports = function(context, taskDef) {
  var repo = context.repository;

  var complexityAnalysisTaskName = function(lang) {
    return lang + '-complexity-analysis';
  };

  taskDef.add('sloc-analysis', 'Report the number of lines of code for each file', function() {
    return multistream.obj(_.map(repo.allFilenames(), function(filepath) {
      return sloc.analyser.fileAnalysisStream(filepath);
    }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.sloc()));
  });

  taskDef.add('code-analysis', ['sloc-analysis'].concat(_.map(context.languages, complexityAnalysisTaskName)));
};
