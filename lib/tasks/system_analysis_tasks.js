var _            = require('lodash'),
    map          = require('through2-map'),
    Q            = require('q'),
    utils        = require('../utils'),
    pp           = require('../parallel_processing'),
    codeMaat     = require('../analysers/code_maat');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('generate-boundaries-file', function() {
    var content = _.reduce(context.boundaries, function(lines, boundary) {
      return lines.concat(_.map(boundary.paths, function(path) { return path + ' => ' + boundary.name; }));
    }, []).join('\n');
    return utils.fileSystem.writeToFile(helpers.files.codeBoundaries(), content);
  });

  taskDef.add('system-evolution-analysis', 'Analyise the evolution and the coupling in time of different parts of your system\nUsage: system-evolution-analysis --boundary <b> [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-log-dump', 'generate-boundaries-file'], function() {
    var runAnalysis = function(analyser, reportFile, transform) {
      var stream = pp.objectStreamCollector()
      .mergeAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(period) {
        return codeMaat[analyser]
        .fileAnalysisStream(helpers.files.vcslog(period), { '-g': helpers.files.codeBoundaries() })
        .pipe(map.obj(_.partial(transform, period)));
      }))
      .pipe(utils.json.objectArrayToFileStream(reportFile));

      return utils.stream.streamToPromise(stream);
    };

    return helpers.report.publish('system-evolution', function(publisher) {
      return Q.allSettled(_.map([
        [
          'temporalCouplingAnalyser',
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
          'revisionsAnalyser',
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
  });
};
