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
    reporting = require('../reporting'),
    logger    = require('../log').Logger,
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.addAnalysisTask('sum-of-coupling-analysis',
    {
      description: 'Analyse the sum of coupling for each file',
      reportName: 'sum-of-coupling',
      parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }],
      reportFile: 'sum-of-coupling-data.json',
      run: function(publisher) {
        publisher.enableDiagram('sum-of-coupling');
        var stream = helpers.codeMaat.sumCouplingAnalysis(helpers.files.vcsNormalisedLog(context.dateRange))
          .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));
        return utils.json.objectArrayToFileStream(publisher.addReportFile(), stream);
      }
    }, gulp.parallel('vcs-log-dump'));

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

        var allReports = _.map(context.timePeriods, function(period) {
          return pp.objectStreamProcessor().processAll([
            _.wrap(period, tcAnalysis),
            _.wrap(period, ecAnalysis)
          ]).then(function(streamPromises) {
            if (_.some(streamPromises, _.method('isRejected'))) {
              throw new Error(_.map(_.select(streamPromises, _.method('isRejected')), _.method('reason')));
            }

            return new reporting.ReportComposer(helpers.files.sloc())
              .mergeWith(streamPromises[0].value(), {
                matchStrategy: _.partial(utils.pathMatchers.areCoupledWith, context.parameters.targetFile),
                mergeStrategy: reporting.MergeStrategies.extension(['couplingDegree', 'revisionsAvg'])
              })
              .mergeWith(streamPromises[1].value(), {
                matchStrategy: utils.pathMatchers.haveSamePath,
                mergeStrategy: reporting.MergeStrategies.extension(['addedLines', 'deletedLines'])
              })
              .buildReport().then(function(reportData) {
                if (_.some(reportData, 'couplingDegree')) {
                  var dataTree = helpers.graphData.weightedTree(reportData, 'path', 'couplingDegree');
                  return utils.json.objectToFile(publisher.addReportFile(period), dataTree);
                } else {
                  logger.info('No coupling data available for period ', period.toString());
                }
              });
          });
        });

        return Bluebird.all(allReports);
      }
    }, gulp.parallel('vcs-log-dump', 'sloc-report'));
};
