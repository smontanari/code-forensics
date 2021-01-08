/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _     = require('lodash'),
    gulp  = require('gulp'),
    pp    = require('../parallel_processing'),
    sloc  = require('../analysers/sloc'),
    utils = require('../utils/');

module.exports = function(taskDef, context, helpers) {
  var slocReport = function() {
    var stream = pp.streamProcessor().mergeAll(context.repository.allFiles(), function(file) {
      return sloc.analyser().fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    });

    return utils.json.objectArrayToFileStream(helpers.files.sloc(), stream);
  };

  var codeStatsReports = _.reduce(context.languages, function(fns, lang) {
    var taskFn = utils.require_ifexists(__dirname, 'complexity_analysis/' + lang + '_tasks');
    if (taskFn) {
      var fn = taskFn(taskDef, context, helpers).functions[lang + 'ComplexityReport'];
      if (fn) { fns.push(fn); }
    }
    return fns;
  }, [slocReport]);

  return {
    functions: {
      slocReport: slocReport,
      codeStatsReports: gulp.parallel(codeStatsReports) //test this function
    },
    tasks: function() {
      taskDef.addTask('sloc-report', slocReport);

      taskDef.addTask('code-stats-reports', gulp.parallel(codeStatsReports));

      taskDef.addAnalysisTask('sloc-trend-analysis',
        {
          description: 'Analyse the sloc trend in time for a particular file',
          reportName: 'sloc-trend',
          parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }],
          reportFile: 'sloc-trend-data.json',
          run: function(publisher) {
            publisher.enableDiagram('sloc');
            var stream = helpers.revision.revisionAnalysisStream(sloc.analyser());
            return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
          }
        }
      );
    }
  };
};
