/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _         = require('lodash'),
    gulp      = require('gulp'),
    filter    = require('through2-filter'),
    pp        = require('../parallel_processing'),
    reporting = require('../reporting'),
    logger    = require('../log').Logger,
    utils     = require('../utils'),
    codeTasks = require('./code_analysis_tasks'),
    vcsTasks  = require('./vcs_tasks');

module.exports = function(taskDef, context, helpers) {
  var vcsFunctions  = vcsTasks(taskDef, context, helpers).functions,
      codeFunctions = codeTasks(taskDef, context, helpers).functions;

  return  {
    tasks: function() {
      taskDef.addAnalysisTask('sum-of-coupling-analysis',
        {
          description: 'Analyse the sum of coupling for each file',
          reportName: 'sum-of-coupling',
          parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }],
          reportFile: 'sum-of-coupling-data.json',
          run: function(publisher) {
            publisher.enableDiagram('sum-of-coupling');
            var stream = helpers.codeMaat.sumCouplingAnalysis(helpers.files.vcsNormalisedLog(context.dateRange))
              .pipe(filter.obj(function(obj) { return context.repository.fileExists(obj.path); }));
            return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
          }
        }, vcsFunctions.vcsLogDump);

      taskDef.addAnalysisTask('temporal-coupling-analysis',
        {
          description: 'Analyse the evolution of coupling in time for a particular file',
          reportName: 'temporal-coupling',
          parameters: [{ name: 'targetFile', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }, { name: 'timeSplit' }],
          reportFile: 'temporal-coupling-data.json',
          run: function(publisher) {
            publisher.enableDiagram('temporal-coupling');
            var tcAnalysis = function(period) {
              return helpers.codeMaat.temporalCouplingAnalysis(helpers.files.vcsNormalisedLog(period))
              .pipe(filter.obj(_.partial(utils.pathMatchers.isCoupledWith, context.parameters.targetFile)));
            };

            var ecAnalysis = function(period) {
              return helpers.codeMaat.entityChurnAnalysis(helpers.files.vcsNormalisedLog(period));
            };

            var createReport = function(period) {
              return new reporting.ReportComposer(helpers.files.sloc())
                .mergeWith(pp.streamProcessor().read(_.wrap(period, tcAnalysis)), {
                  matchStrategy: _.partial(
                    utils.pathMatchers.areCoupledWith,
                    context.parameters.targetFile
                  ),
                  mergeStrategy: reporting.MergeStrategies.extension(
                    ['couplingDegree', 'revisionsAvg']
                  )
                })
                .mergeWith(pp.streamProcessor().read(_.wrap(period, ecAnalysis)), {
                  matchStrategy: utils.pathMatchers.haveSamePath,
                  mergeStrategy: reporting.MergeStrategies.extension(
                    ['addedLines', 'deletedLines']
                  )
                })
                .buildReport()
                .then(function(reportData) {
                  if (_.some(reportData, 'couplingDegree')) {
                    var dataTree = helpers.graphData.weightedTree(reportData, 'path', 'couplingDegree');
                    return utils.json.objectToFile(publisher.addReportFile(period), dataTree);
                  } else {
                    logger.info('No coupling data available for period ', period.toString());
                  }
                });
            };

            return pp.taskExecutor().runAll(context.timePeriods, createReport);
          }
        }, gulp.parallel(vcsFunctions.vcsLogDump, codeFunctions.slocReport));
    }
  };
};
