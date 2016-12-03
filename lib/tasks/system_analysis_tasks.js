var _     = require('lodash'),
    map   = require('through2-map'),
    Q     = require('q'),
    utils = require('../utils'),
    pp    = require('../parallel_processing');

module.exports = function(taskDef, context, helpers) {
  taskDef.addAnalysisTask('system-evolution-analysis',
    {
      description: 'Analyse the evolution and the coupling in time of different parts of your system',
      reportName: 'system-evolution',
      parameters: [{ name: 'boundary', required: true }, { name: 'dateFrom' }, { name: 'dateTo' }, { name: 'frequency' }],
      reportFiles: {
        'coupling-trend': 'system-coupling-data.json',
        'revisions-trend': 'system-revisions-data.json'
      }
    }, ['vcs-log-dump', 'generate-boundaries-file'], function(publisher) {
    var runAnalysis = function(analysis, reportFile, transform) {
      var stream = pp.objectStreamCollector()
      .mergeAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
        return helpers.codeMaat[analysis](helpers.files.vcsNormalisedLog(period), { '-g': helpers.files.codeBoundaries() })
        .pipe(map.obj(_.partial(transform, period)));
      }));

      return utils.stream.streamToPromise(utils.json.objectArrayToFileStream(reportFile, stream));
    };

    return Q.allSettled(_.map([
      [
        'temporalCouplingAnalysis',
        publisher.addReportFileForType('coupling-trend'),
        function(period, obj) {
          return {
            name: obj.path,
            coupledName: obj.coupledPath,
            couplingDegree: obj.couplingDegree,
            date: period.endDate
          };
        }
      ],
      [
        'revisionsAnalysis',
        publisher.addReportFileForType('revisions-trend'),
        function(period, obj) {
          return {
            name: obj.path,
            revisions: obj.revisions,
            date: period.endDate
          };
        }
      ]
    ], _.spread(runAnalysis)));
  });
};
