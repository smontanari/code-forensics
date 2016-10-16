var _           = require('lodash'),
    multistream = require('multistream'),
    sloc        = require('../analysers/sloc'),
    utils       = require('../utils/');

module.exports = function(taskDef, context, helpers) {
  _.each(context.languages, function(lang) {
    var taskFn = utils.require_ifexists(__dirname, 'complexity_analysis/' + lang);
    taskFn(taskDef, context);
  });

  var complexityAnalysisTasks = _.reduce(context.languages, function(t, lang) {
    var taskName = lang + '-complexity-analysis';
    if (taskDef.isTaskDefined(taskName)) { t.push(taskName); }
    return t;
  }, []);

  taskDef.add('sloc-analysis', 'Report the number of lines of code for each file', function() {
    return multistream.obj(_.map(context.repository.allFiles(), function(file) {
      return sloc.analyser.fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }))
    .pipe(utils.json.objectArrayToFileStream(helpers.files.sloc()));
  });

  taskDef.add('code-analysis', ['sloc-analysis'].concat(complexityAnalysisTasks));
};
