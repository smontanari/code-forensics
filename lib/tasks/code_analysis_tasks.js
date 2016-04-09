var _           = require('lodash'),
    multistream = require('multistream'),
    map         = require('through2-map'),
    sloc        = require('../analysers/sloc'),
    utils       = require('../utils/');

module.exports = function(context, taskDef) {
  var repo = context.repository;

  taskDef.add('sloc-analysis', 'Report the number of lines of code for each file', function() {
    return multistream.obj(_.map(repo.allFilenames(), function(filepath) {
      return sloc.analyser.fileAnalysisStream(filepath);
    }))
    .pipe(utils.json.objectArrayToFileStream(context.files.temp.sloc()));
  });

  var codeAnalysisTasks = _.reduce(context.languages, function(tasks, lang) {
    tasks.push(utils.require_ifexists(__dirname, 'complexity_analysis/' + lang)(context, taskDef));
    return tasks;
  }, ['sloc-analysis']);

  taskDef.add('code-analysis', codeAnalysisTasks);
};
