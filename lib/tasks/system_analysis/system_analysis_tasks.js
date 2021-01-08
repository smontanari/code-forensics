/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    gulp              = require('gulp'),
    pp                = require('../../parallel_processing'),
    utils             = require('../../utils'),
    logger            = require('../../log').Logger,
    vcsTasks          = require('../vcs_tasks'),
    miscTasks         = require('../misc_tasks'),
    DataCollector     = require('./data_collector'),
    CollectStrategies = require('./metric_collection_strategies'),
    summaryMetrics    = require('./summary_metrics'),
    churnMetrics      = require('./churn_metrics'),
    couplingMetrics   = require('./coupling_metrics');

module.exports = function(taskDef, context, helpers) {
  var vcsFunctions  = vcsTasks(taskDef, context, helpers).functions,
      miscFunctions = miscTasks(taskDef, context, helpers).functions;

  var dataCollector = new DataCollector(context.timePeriods);

  var evolutionReport = function(publisher) {
    var runReport = function(report) {
      return dataCollector.collectDataStream(report.collectStrategy)
        .then(function(reportStream) {
          _.each(report.diagrams, publisher.enableDiagram.bind(publisher));
          var reportFile = publisher.addReportFileForType(report.type);
          return utils.stream.streamToPromise(utils.json.objectArrayToFileStream(reportFile, reportStream)).reflect();
        })
        .catch(function(err) {
          logger.warn(report.type + ' report not created: ' + err);
        });
    };

    var systemReports = {
      summary: {
        diagrams: ['revisions-trend', 'commits-trend', 'authors-trend'],
        type: 'summary-stats',
        collectStrategy: CollectStrategies.noLayer(helpers, { metrics: summaryMetrics, analysis: 'summaryAnalysis' })
      },
      churn: {
        diagrams: ['churn-trend'],
        type: 'churn-trend',
        collectStrategy: CollectStrategies.noLayer(helpers, { metrics: churnMetrics, analysis: 'absoluteChurnAnalysis' })
      }
    };

    var layeredReports = {
      summary: {
        diagrams: ['revisions-trend', 'commits-trend', 'authors-trend'],
        type: 'summary-stats',
        collectStrategy: CollectStrategies.splitLayer(helpers, { metrics: summaryMetrics, analysis: 'summaryAnalysis', layerGrouping: context.layerGrouping })
      },
      churn: {
        diagrams: ['churn-trend'],
        type: 'churn-trend',
        collectStrategy: CollectStrategies.multiLayer(helpers, { metrics: churnMetrics, analysis: 'entityChurnAnalysis' })
      },
      coupling: {
        diagrams: ['coupling-trend'],
        type: 'coupling-trend',
        collectStrategy: CollectStrategies.multiLayer(helpers, { metrics: couplingMetrics, analysis: 'temporalCouplingAnalysis' })
      }
    };

    var reports = context.layerGrouping.isEmpty() ? systemReports : layeredReports;
    return pp.taskExecutor().runAll(_.values(reports), runReport);
  };

  return {
    tasks: function() {
      taskDef.addAnalysisTask('system-evolution-analysis',
        {
          description: 'Analyse the evolution and the coupling in time of different parts of your system',
          reportName: 'system-evolution',
          parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'timeSplit' }, { name: 'layerGroup' }],
          reportFiles: {
            'summary-stats':  'system-summary-data.json',
            'churn-trend':    'system-churn-data.json',
            'coupling-trend': 'system-coupling-data.json'
          },
          run: evolutionReport
        }, gulp.parallel(vcsFunctions.vcsLogDump, miscFunctions.generateLayerGroupingFiles));
    }
  };
};
