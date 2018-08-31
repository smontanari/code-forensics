/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    gulp              = require('gulp'),
    Bluebird          = require('bluebird'),
    utils             = require('../../utils'),
    vcsTasks          = require('../vcs_tasks'),
    miscTasks         = require('../misc_tasks'),
    DataCollector     = require('./data_collector'),
    summaryMetrics    = require('./summary_metrics'),
    churnMetrics      = require('./churn_metrics'),
    couplingMetrics   = require('./coupling_metrics');

module.exports = function(taskDef, context, helpers) {
  var vcsFunctions  = vcsTasks(taskDef, context, helpers).functions,
      miscFunctions = miscTasks(taskDef, context, helpers).functions;

  var dataCollector = new DataCollector(context, helpers.files, helpers.codeMaat);

  var evolutionReport = function(publisher) {
    var runAnalysis = function(analysis) {
      publisher.enableDiagram(analysis.diagramName);
      var reportFile = publisher.addReportFileForType(analysis.diagramName);
      var reportStream = dataCollector.reportStream(analysis);
      return utils.stream.streamToPromise(utils.json.objectArrayToFileStream(reportFile, reportStream)).reflect();
    };

    var runAll = function(analyses) {
      var executableAnalyses = _.filter(analyses, function(a) {
        return helpers.codeMaat[a.codeMaatAnalysis].isSupported();
      });
      return Bluebird.all(_.map(executableAnalyses, runAnalysis));
    };

    var revisionsMetricsCollector = _.partialRight(_.pick, 'revisions');

    var systemAnalyses = {
      summary: {
        codeMaatAnalysis: 'summaryAnalysis',
        diagramName: 'stats-trend',
        selector: summaryMetrics.metricCollector,
        initialValue: summaryMetrics.metricInitialValue,
        accumulators: summaryMetrics.metricAccumulatorsMap
      },
      churn: {
        codeMaatAnalysis: 'absoluteChurnAnalysis',
        diagramName: 'churn-trend',
        selector: churnMetrics.metricCollector,
        initialValue: churnMetrics.metricInitialValue,
        accumulators: churnMetrics.metricAccumulatorsMap
      }
    };

    var layeredAnalyses = {
      summary: {
        codeMaatAnalysis: 'revisionsAnalysis',
        diagramName: 'stats-trend',
        selector: revisionsMetricsCollector,
        initialValue: { revisions: 0 },
        accumulators: { cumulativeRevisions: _.property('revisions') }
      },
      churn: {
        codeMaatAnalysis: 'entityChurnAnalysis',
        diagramName: 'churn-trend',
        selector: churnMetrics.metricCollector,
        initialValue: churnMetrics.metricInitialValue,
        accumulators: churnMetrics.metricAccumulatorsMap
      },
      coupling: {
        codeMaatAnalysis: 'temporalCouplingAnalysis',
        diagramName: 'coupling-trend',
        selector: couplingMetrics.metricCollector
      }
    };

    if (context.layerGrouping.isEmpty()) {
      return runAll([systemAnalyses.summary, systemAnalyses.churn]);
    } else {
      return runAll(_.values(layeredAnalyses));
    }
  };

  return {
    tasks: function() {
      taskDef.addAnalysisTask('system-evolution-analysis',
        {
          description: 'Analyse the evolution and the coupling in time of different parts of your system',
          reportName: 'system-evolution',
          parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'timeSplit' }, { name: 'layerGroup' }],
          reportFiles: {
            'stats-trend':    'system-summary-data.json',
            'churn-trend':    'system-churn-data.json',
            'coupling-trend': 'system-coupling-data.json'
          },
          run: evolutionReport
        }, gulp.parallel(vcsFunctions.vcsLogDump, miscFunctions.generateLayerGroupingFiles));
    }
  };
};
