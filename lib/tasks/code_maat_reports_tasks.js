var filter = require('through2-filter'),
    utils  = require('../utils');

module.exports = function(taskDef, context, helpers) {
  var executeReport = function(analysis, reportType) {
    var stream = helpers.codeMaat[analysis](helpers.files.vcsNormalisedLog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));
    return utils.json.objectArrayToFileStream(helpers.files[reportType](), stream);
  };

  var taskInfo = { parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }] };

  taskDef.addTask('revisions-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('revisionsAnalysis', 'revisions');
  });

  taskDef.addTask('effort-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('effortAnalysis', 'effort');
  });

  taskDef.addTask('authors-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('authorsAnalysis', 'authors');
  });

  taskDef.addTask('main-dev-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('mainDevAnalysis', 'mainDeveloper');
  });

  taskDef.addTask('code-ownership-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('codeOwnershipAnalysis', 'codeOwnership');
  });
};
