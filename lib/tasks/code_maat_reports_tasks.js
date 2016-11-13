var filter   = require('through2-filter'),
    codeMaat = require('../analysers/code_maat'),
    utils    = require('../utils');

module.exports = function(taskDef, context, helpers) {
  var executeReport = function(analyser, reportType) {
    var stream = codeMaat[analyser].fileAnalysisStream(helpers.files.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));
    return utils.json.objectArrayToFileStream(helpers.files[reportType](), stream);
  };

  var taskInfo = { parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }] };

  taskDef.addTask('revisions-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('revisionsAnalyser', 'revisions');
  });

  taskDef.addTask('effort-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('effortAnalyser', 'effort');
  });

  taskDef.addTask('authors-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('authorsAnalyser', 'authors');
  });

  taskDef.addTask('main-dev-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('mainDevAnalyser', 'mainDeveloper');
  });

  taskDef.addTask('code-ownership-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('codeOwnershipAnalyser', 'codeOwnership');
  });
};
