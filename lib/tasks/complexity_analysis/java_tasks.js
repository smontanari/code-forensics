/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _    = require('lodash'),
    java = require('../../analysers/java'),
    pp   = require('../../parallel_processing'),
    utils = require('../../utils');

module.exports = function(taskDef, context, helpers) {
  var javaComplexityReport = function() {
    var stream = pp.streamProcessor().mergeAll(context.repository.sourceFiles('java'), function(file) {
      return java.analyser().fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    });

    return utils.json.objectArrayToFileStream(helpers.files.codeComplexity('java'), stream);
  };

  return {
    functions: {
      javaComplexityReport: javaComplexityReport
    },
    tasks: function() {
      taskDef.addTask('java-complexity-report', javaComplexityReport);
      taskDef.addAnalysisTask('java-complexity-trend-analysis',
        {
          description: 'Analyse the complexity trend in time for a particular Java file',
          reportName: 'complexity-trend',
          parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }],
          reportFile: 'complexity-trend-data.json',
          run: function(publisher) {
            _.each(['total', 'func-mean', 'func-sd'], function(name) { publisher.enableDiagram(name); });
            var stream = helpers.revision.revisionAnalysisStream(java.analyser());
            return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
          }
        }
      );
    }
  };
};
