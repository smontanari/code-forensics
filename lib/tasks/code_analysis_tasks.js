var _           = require('lodash'),
    multistream = require('multistream'),
    sloc        = require('../analysers/sloc'),
    utils       = require('../utils/');

module.exports = function(taskDef, context, helpers) {
  _.each(context.languages, function(lang) {
    var taskFn = utils.require_ifexists(__dirname, 'complexity_analysis/' + lang);
    taskFn(taskDef, context, helpers);
  });

  var complexityAnalysisTasks = _.reduce(context.languages, function(t, lang) {
    var taskName = lang + '-complexity-report';
    if (taskDef.isTaskDefined(taskName)) { t.push(taskName); }
    return t;
  }, []);

  taskDef.addTask('sloc-report', function() {
    var stream = multistream.obj(_.map(context.repository.allFiles(), function(file) {
      return sloc.analyser().fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }));

    return utils.json.objectArrayToFileStream(helpers.files.sloc(), stream);
  });

  taskDef.addTask('code-stats-reports', ['sloc-report'].concat(complexityAnalysisTasks));
};
