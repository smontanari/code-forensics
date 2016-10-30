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

  taskDef.add('revisions-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('revisionsAnalyser', 'revisions');
  });

  taskDef.add('effort-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('effortAnalyser', 'effort');
  });

  taskDef.add('authors-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('authorsAnalyser', 'authors');
  });

  taskDef.add('main-dev-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('mainDevAnalyser', 'mainDev');
  });

  taskDef.add('code-ownership-report', taskInfo, ['vcs-log-dump'], function() {
    return executeReport('codeOwnershipAnalyser', 'codeOwnership');
  });
};
