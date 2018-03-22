/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _         = require('lodash'),
    gulp      = require('gulp'),
    filter    = require('through2-filter'),
    Bluebird  = require('bluebird'),
    pp        = require('../parallel_processing'),
    logger    = require('../log').Logger,
    utils     = require('../utils'),
    appConfig = require('../runtime/app_config');

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
    var vcsType = appConfig.get('versionControlSystem');
    logger.info('Codemaat: ' + reportType + ' analysis not avalable for ' + vcsType + '. Skipping...');
    return Bluebird.resolve();
  };

  var taskInfo = { parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }] };

  taskDef.addTask('revisions-report', _.assign({}, taskInfo, {
    run: function() { return runTask('revisionsAnalysis', 'revisions'); }
  }), gulp.parallel('vcs-log-dump'));

  taskDef.addTask('effort-report', _.assign({}, taskInfo, {
    run: function() { return runTask('effortAnalysis', 'effort'); }
  }), gulp.parallel('vcs-log-dump'));

  taskDef.addTask('authors-report', _.assign({}, taskInfo, {
    run: function() { return runTask('authorsAnalysis', 'authors'); }
  }), gulp.parallel('vcs-log-dump'));

  taskDef.addTask('main-dev-report', _.assign({}, taskInfo, {
    run: function() { return runTask('mainDevAnalysis', 'mainDeveloper'); }
  }), gulp.parallel('vcs-log-dump'));

  taskDef.addTask('code-ownership-report', _.assign({}, taskInfo, {
    run: function() { return runTask('codeOwnershipAnalysis', 'codeOwnership'); }
  }), gulp.parallel('vcs-log-dump'));
};
