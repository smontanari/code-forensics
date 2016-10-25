var utils = require('../utils');

module.exports = function(taskDef, context, helpers) {
  var executeReport = function(analyser, reportType) {
    var stream = helpers.codeMaat.reportStream(analyser, helpers.files.vcslog(context.dateRange));
    return utils.json.objectArrayToFileStream(helpers.files[reportType](), stream);
  };

  taskDef.add('revisions-report', 'Report on the number of vcs revisions for each file\nUsage: gulp revisions-analysis [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return executeReport('revisionsAnalyser', 'revisions');
  });

  taskDef.add('effort-report', ['vcs-log-dump'], function() {
    return executeReport('effortAnalyser', 'effort');
  });

  taskDef.add('authors-report', ['vcs-log-dump'], function() {
    return executeReport('authorsAnalyser', 'authors');
  });

  taskDef.add('main-dev-report', ['vcs-log-dump'], function() {
    return executeReport('mainDevAnalyser', 'mainDev');
  });
};
