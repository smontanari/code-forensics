/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var gulp      = require('gulp'),
    Bluebird  = require('bluebird'),
    logger    = require('../log'),
    pp        = require('../parallel_processing'),
    utils     = require('../utils'),
    appConfig = require('../runtime/app_config'),
    vcsTasks  = require('./vcs_tasks');

module.exports = function(taskDef, context, helpers) {
  var writeReport = function(analysis, reportType) {
    var stream = helpers.codeMaat[analysis](helpers.files.vcsNormalisedLog(context.dateRange));
    return utils.json.objectArrayToFileStream(helpers.files[reportType](), stream);
  };

  var runAnalysis = function(analysis, reportType) {
    if (helpers.codeMaat[analysis].isSupported()) {
      return pp.streamProcessor().process(function() {
        return writeReport(analysis, reportType);
      });
    }
    var vcsType = appConfig.get('versionControlSystem');
    logger.info('Codemaat: ' + reportType + ' analysis not avalable for ' + vcsType + '. Skipping...');
    return Bluebird.resolve();
  };

  var vcsFunctions = vcsTasks(taskDef, context, helpers).functions;

  var revisionsReport     = function() { return runAnalysis('revisionsAnalysis', 'revisions'); },
      effortReport        = function() { return runAnalysis('effortAnalysis', 'effort'); },
      authorsReport       = function() { return runAnalysis('authorsAnalysis', 'authors'); },
      mainDevReport       = function() { return runAnalysis('mainDevAnalysis', 'mainDeveloper'); },
      codeOwnershipReport = function() { return runAnalysis('codeOwnershipAnalysis', 'codeOwnership'); };

  return {
    functions: {
      revisionsReport:     revisionsReport,
      effortReport:        effortReport,
      authorsReport:       authorsReport,
      mainDevReport:       mainDevReport,
      codeOwnershipReport: codeOwnershipReport
    },
    tasks: function() {
      var taskInfo = { parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }] };

      taskDef.addTask('revisions-report', taskInfo,
        gulp.series(vcsFunctions.vcsLogDump, revisionsReport));

      taskDef.addTask('effort-report', taskInfo,
        gulp.series(vcsFunctions.vcsLogDump, effortReport));

      taskDef.addTask('authors-report', taskInfo,
        gulp.series(vcsFunctions.vcsLogDump, authorsReport));

      taskDef.addTask('main-dev-report', taskInfo,
        gulp.series(vcsFunctions.vcsLogDump, mainDevReport));

      taskDef.addTask('code-ownership-report', taskInfo,
        gulp.series(vcsFunctions.vcsLogDump, codeOwnershipReport));
    }
  };
};
