/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _           = require('lodash'),
    multistream = require('multistream'),
    escomplex   = require('../../analysers/escomplex'),
    utils       = require('../../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.addTask('javascript-complexity-report', function() {
    var stream = multistream.obj(_.map(context.repository.sourceFiles('javascript'), function(file) {
      return escomplex.analyser().fileAnalysisStream(file.absolutePath, function(report) {
        return _.extend(report, { path: file.relativePath });
      });
    }));

    return utils.json.objectArrayToFileStream(helpers.files.codeComplexity('javascript'), stream);
  });

  taskDef.addAnalysisTask('javascript-complexity-trend-analysis',
    {
      description: 'Analyse the complexity trend in time for a particular javascript file',
      reportName: 'complexity-trend',
      parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }],
      reportFile: 'complexity-trend-data.json'
    }, function(publisher) {
      _.each(['total', 'method-mean', 'method-sd'], function(name) { publisher.enableDiagram(name); });
      var stream = helpers.revision.revisionAnalysisStream(escomplex.analyser());
      return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
  });
};
