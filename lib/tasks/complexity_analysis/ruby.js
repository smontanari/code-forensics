/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _     = require('lodash'),
    flog  = require('../../analysers/flog'),
    pp    = require('../../parallel_processing'),
    utils = require('../../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.addTask('ruby-complexity-report', {
    run: function() {
      var stream = pp.objectStreamCollector()
      .mergeAll(utils.arrays.arrayToFnFactory(context.repository.sourceFiles('ruby'), function(file) {
        return flog.analyser().fileAnalysisStream(file.absolutePath, function(report) {
          return _.extend(report, { path: file.relativePath });
        });
      }));

      return utils.json.objectArrayToFileStream(helpers.files.codeComplexity('ruby'), stream);
    }
  });

  taskDef.addAnalysisTask('ruby-complexity-trend-analysis',
    {
      description: 'Analyse the complexity trend in time for a particular ruby file',
      reportName: 'complexity-trend',
      parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }],
      reportFile: 'complexity-trend-data.json',
      run: function(publisher) {
        _.each(['total', 'func-mean', 'func-sd'], function(name) { publisher.enableDiagram(name); });
        var stream = helpers.revision.revisionAnalysisStream(flog.analyser());
        return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
      }
    });
};
