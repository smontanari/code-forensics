/*
 * code-forensics
 * Copyright (C) 2016-2018 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _                 = require('lodash'),
    sortStream        = require('sort-stream2'),
    moment            = require('moment'),
    gulp              = require('gulp'),
    Bluebird          = require('bluebird'),
    utils             = require('../../utils'),
    pp                = require('../../parallel_processing'),
    vcsTasks          = require('../vcs_tasks'),
    miscTasks         = require('../misc_tasks'),
    TimePeriodResults = require('./time_period_results');

module.exports = function(taskDef, context, helpers) {
  var vcsFunctions  = vcsTasks(taskDef, context, helpers).functions,
      miscFunctions = miscTasks(taskDef, context, helpers).functions;

  var evolutionReport = function(publisher) {
    var groupParam = context.layerGrouping.isEmpty() ? {} : { '-g': helpers.files.layerGrouping() };

    var runAnalysis = function(streamTransform, options) {
      publisher.enableDiagram(options.diagramName);
      var reportFile = publisher.addReportFileForType(options.diagramName);
      var stream = pp.objectStreamCollector()
      .mergeAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
        return helpers.codeMaat[options.analysisName](helpers.files.vcsNormalisedLog(period), groupParam)
        .pipe(options[streamTransform].call(null, period));
        })
      );
      if (options.resultsAccumulate) {
        stream = stream
          .pipe(sortStream(function (a, b) { return moment(a.date).isAfter(b.date); }))
          .pipe(options.resultsAccumulate);
      }

      return utils.stream.streamToPromise(utils.json.objectArrayToFileStream(reportFile, stream)).reflect();
    };

    var runAll = function(analyses, streamTransform) {
      var executableAnalyses = _.filter(analyses, function(a) {
        return helpers.codeMaat[a.analysisName].isSupported();
      });
      return Bluebird.all(_.map(executableAnalyses, _.wrap(streamTransform, runAnalysis)));
    };

    var revisionsMetricsCollector = _.partialRight(_.pick, 'revisions');

    var churnMetricsCollector = function (obj) {
      return {
        addedLines: obj.addedLines,
        deletedLines: obj.deletedLines,
        totalLines: obj.addedLines - obj.deletedLines,
      };
    };

    var couplingMetricsCollector = function (obj) {
      return {
        coupledName: obj.coupledPath,
        couplingDegree: obj.couplingDegree,
      };
    };

    var systemAnalyses = {
      revisions: {
        analysisName: 'revisionsAnalysis',
        diagramName: 'revisions-trend',
        resultsMap: TimePeriodResults.resultsMapper(revisionsMetricsCollector),
        resultsReduce: TimePeriodResults.resultsReducer(
          revisionsMetricsCollector,
          { revisions: 0 }
        ),
        resultsAccumulate: TimePeriodResults.resultsAccumulator(
          { cumulativeRevisions: _.property('revisions') }
        )
      },
      churn: {
        analysisName: 'entityChurnAnalysis',
        diagramName: 'churn-trend',
        resultsMap: TimePeriodResults.resultsMapper(churnMetricsCollector),
        resultsReduce: TimePeriodResults.resultsReducer(
          churnMetricsCollector,
          { addedLines: 0, deletedLines: 0, totalLines: 0 }
        ),
        resultsAccumulate: TimePeriodResults.resultsAccumulator(
          { cumulativeLines: _.property('totalLines') }
        )
      },
      coupling: {
        analysisName: 'temporalCouplingAnalysis',
        diagramName: 'coupling-trend',
        resultsMap: TimePeriodResults.resultsMapper(couplingMetricsCollector)
      }
    };

    if (context.layerGrouping.isEmpty()) {
      return runAll([systemAnalyses.revisions, systemAnalyses.churn], 'resultsReduce');
    } else {
      return runAll(_.values(systemAnalyses), 'resultsMap');
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
            'coupling-trend':  'system-coupling-data.json',
            'churn-trend':     'system-churn-data.json',
            'revisions-trend': 'system-revisions-data.json'
          },
          run: evolutionReport
        }, gulp.parallel(vcsFunctions.vcsLogDump, miscFunctions.generateLayerGroupingFile));
    }
  };
};
