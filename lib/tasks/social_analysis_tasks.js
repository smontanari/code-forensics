var fs        = require('fs'),
    _         = require('lodash'),
    filter    = require('through2-filter'),
    pp        = require('../parallel_processing'),
    reporting = require('../reporting'),
    wordCount = require('../analysers/word_count'),
    codeMaat  = require('../analysers/code_maat'),
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('commit-cloud', 'Generate a word-cloud of commit messages\nUsage: commit-cloud [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-commit-messages'], function() {
    return helpers.report.publish('commit-word-cloud', function(publisher) {
      return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(timePeriod) {
        var stream = fs.createReadStream(helpers.files.vcsCommitMessages(timePeriod))
          .pipe(wordCount.analyser.textAnalysisStream(context.commitCloudFilters));

        return utils.json.objectToFileStream(publisher.addReportFile(timePeriod), stream);
      }));
    });
  });

  taskDef.add('effort-analysis', ['vcs-log-dump'], function() {
    var stream = codeMaat.effortAnalyser
      .fileAnalysisStream(helpers.files.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));

    return utils.json.objectArrayToFileStream(helpers.files.effort(), stream);
  });

  taskDef.add('developer-effort-analysis', 'Report on the distribution of effort (in number of revisions) amongst developers/teams for each file\nUsage: developer-effort-analysis  [--dateFrom <date> --dateTo <date>]', ['effort-analysis'], function() {
    return helpers.report.publish('developer-effort', function(publisher) {
      return utils.json.fileToObject(helpers.files.effort()).then(function(data) {
        _.each(['individual', 'team'], function(type) {
          var revisionsData = helpers.developerData.aggregateBy(data, type);
          var tree = helpers.graphData.tree(revisionsData, 'path');
          return utils.json.objectToFile(publisher.addReportFileForType(type + '-effort'), tree);
        });
      });
    });
  });

  taskDef.add('authors-analysis', ['vcs-log-dump'], function() {
    var stream = codeMaat.authorsAnalyser
      .fileAnalysisStream(helpers.files.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));

    return utils.json.objectArrayToFileStream(helpers.files.authors(), stream);
  });

  taskDef.add('main-dev-analysis', ['vcs-log-dump'], function() {
    var stream = codeMaat.mainDevAnalyser
      .fileAnalysisStream(helpers.files.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }));

    return utils.json.objectArrayToFileStream(helpers.files.mainDev(), stream);
  });

  taskDef.add('authors-coupling', 'Identify the coupling between main developers of files with the most authors\nUsage: authors-coupling  [--dateFrom <date> --dateTo <date> --maxCoupledFiles <n> [default 5]]', ['authors-analysis', 'main-dev-analysis'], function() {
    var tcAnalysis = codeMaat.temporalCouplingAnalyser
      .fileAnalysisStream(helpers.files.vcslog(context.dateRange), { '-t': 1 })
      .pipe(filter.obj(function(obj) {
        return context.repository.isValidPath(obj.path) && context.repository.isValidPath(obj.coupledPath);
      }));

    return helpers.report.publish('authors-coupling', function(publisher) {
      return new reporting.ReportComposer(helpers.files.authors())
        .mergeWith(helpers.files.mainDev(), {
          matchStrategy: utils.pathMatchers.haveSamePath,
          mergeStrategy: reporting.MergeStrategies.extension(['mainDev', 'locAdded', 'ownership'])
        })
        .mergeWith(tcAnalysis, {
          matchStrategy: utils.pathMatchers.areCoupled,
          mergeStrategy: function(reportItem, dataSourceItem) {
            reportItem.coupledEntries = reportItem.coupledEntries || [];
            if (reportItem.coupledEntries.length >= (context.parameters.maxCoupledFiles)) { return false; }
            reportItem.coupledEntries.push({
              path: dataSourceItem.path === reportItem.path ? dataSourceItem.coupledPath : dataSourceItem.path,
              couplingDegree: dataSourceItem.couplingDegree,
              revisionsAvg: dataSourceItem.revisionsAvg
            });
          }
        })
        .buildReport().then(function(reportData) {
          var relevantData = _.filter(reportData, function(reportItem) {
            return _.isArray(reportItem.coupledEntries);
          });
          return utils.json.objectToFile(publisher.addReportFile(), helpers.graphData.flatWeightedTree(relevantData, 'revisions'));
        });
    });
  });
};
