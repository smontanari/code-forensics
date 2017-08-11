/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _      = require('lodash'),
    filter = require('through2-filter'),
    Q      = require('q'),
    pp     = require('../parallel_processing'),
    logger = require('../log').Logger,
    utils  = require('../utils');

module.exports = function(taskDef, context, helpers) {
  var writeReport = function(analysis, reportType) {
    var stream = helpers.codeMaat[analysis](helpers.files.vcsNormalisedLog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));
    return utils.json.objectArrayToFileStream(helpers.files[reportType](), stream);
  };

  var runTask = function(analysis, reportType) {
    if (helpers.codeMaat[analysis].isSupported()) {
      return pp.taskExecutor().processAll([_.partial(writeReport, analysis, reportType)]);
    }
    logger.info('Analysis not avalable for current version control system. Skipping...');
    return Q.resolve();
  };

  var taskInfo = { parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }] };

  taskDef.addTask('revisions-report', taskInfo, ['vcs-log-dump'], function() {
    return runTask('revisionsAnalysis', 'revisions');
  });

  taskDef.addTask('effort-report', taskInfo, ['vcs-log-dump'], function() {
    return runTask('effortAnalysis', 'effort');
  });

  taskDef.addTask('authors-report', taskInfo, ['vcs-log-dump'], function() {
    return runTask('authorsAnalysis', 'authors');
  });

  taskDef.addTask('main-dev-report', taskInfo, ['vcs-log-dump'], function() {
    return runTask('mainDevAnalysis', 'mainDeveloper');
  });

  taskDef.addTask('code-ownership-report', taskInfo, ['vcs-log-dump'], function() {
    return runTask('codeOwnershipAnalysis', 'codeOwnership');
  });
};
