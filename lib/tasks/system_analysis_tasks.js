/*
 * code-forensics
 * Copyright (C) 2016-2017 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var _      = require('lodash'),
    map    = require('through2-map'),
    reduce = require('through2-reduce'),
    Q      = require('q'),
    utils  = require('../utils'),
    pp     = require('../parallel_processing');

module.exports = function(taskDef, context, helpers) {
  taskDef.addAnalysisTask('system-evolution-analysis',
    {
      description: 'Analyse the evolution and the coupling in time of different parts of your system',
      reportName: 'system-evolution',
      parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'timeSplit' }, { name: 'layerGroup' }],
      reportFiles: {
        'coupling-trend':  'system-coupling-data.json',
        'churn-trend':     'system-churn-data.json',
        'revisions-trend': 'system-revisions-data.json'
      }
    }, ['vcs-log-dump', 'generate-layer-grouping-file'], function(publisher) {
    var groupParam = context.layerGrouping.isEmpty() ? {} : { '-g': helpers.files.layerGrouping() };

    var runAnalysis = function(analysis, diagramName, streamTransform) {
      publisher.enableDiagram(diagramName);
      var reportFile = publisher.addReportFileForType(diagramName);
      var stream = pp.objectStreamCollector()
      .mergeAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
        return helpers.codeMaat[analysis](helpers.files.vcsNormalisedLog(period), groupParam)
        .pipe(streamTransform(period));
      }));

      return utils.stream.streamToPromise(utils.json.objectArrayToFileStream(reportFile, stream));
    };

    if (context.layerGrouping.isEmpty()) {
      return Q.allSettled(_.map([
        [
          'revisionsAnalysis',
          'revisions-trend',
          function(period) {
            return reduce.obj(function(previous, obj) {
              return _.assign(previous, {
                revisions: previous.revisions + obj.revisions,
              });
            }, {
              name: 'All files',
              revisions: 0,
              date: period.toDisplayFormat().endDate
            });
          }
        ],
        [
          'entityChurnAnalysis',
          'churn-trend',
          function(period) {
            return reduce.obj(function(previous, obj) {
              return _.assign(previous, {
                addedLines: previous.addedLines + obj.addedLines,
                deletedLines: previous.deletedLines + obj.deletedLines,
                totalLines: previous.totalLines + obj.addedLines - obj.deletedLines
              });
            }, {
              name: 'All files',
              addedLines: 0,
              deletedLines: 0,
              totalLines: 0,
              date: period.toDisplayFormat().endDate
            });
          }
        ]
      ], _.spread(runAnalysis)));
    } else {
      return Q.allSettled(_.map([
        [
          'revisionsAnalysis',
          'revisions-trend',
          function(period) {
            return map.obj(function(obj) {
              return {
                name: obj.path,
                revisions: obj.revisions,
                date: period.toDisplayFormat().endDate
              };
            });
          }
        ],
        [
          'entityChurnAnalysis',
          'churn-trend',
          function(period) {
            return map.obj(function(obj) {
              return {
                name: obj.path,
                addedLines: obj.addedLines,
                deletedLines: obj.deletedLines,
                totalLines: obj.addedLines - obj.deletedLines,
                date: period.toDisplayFormat().endDate
              };
            });
          }
        ],
        [
        'temporalCouplingAnalysis',
          'coupling-trend',
          function(period) {
            return map.obj(function(obj) {
              return {
                name: obj.path,
                coupledName: obj.coupledPath,
                couplingDegree: obj.couplingDegree,
                date: period.toDisplayFormat().endDate
              };
            });
          }
        ]
      ], _.spread(runAnalysis)));
    }
  });
};
