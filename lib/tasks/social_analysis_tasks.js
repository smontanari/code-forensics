var fs        = require('fs'),
    _         = require('lodash'),
    filter    = require('through2-filter'),
    pp        = require('../parallel_processing'),
    reporting = require('../reporting'),
    wordCount = require('../analysers/word_count'),
    codeMaat  = require('../analysers/code_maat'),
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('commit-cloud', 'Generate a word-cloud of commit messages\nUsage: commit-cloud [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-log-messages'], function() {
    return helpers.reportHelper.publish('commit-word-cloud', function(publisher) {
      return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(timePeriod) {
        return fs.createReadStream(helpers.filesHelper.vcslogMessages(timePeriod))
          .pipe(wordCount.analyser.textAnalysisStream(context.commitCloudFilters))
          .pipe(utils.json.objectToFileStream(publisher.addReportFile(timePeriod)));
      }));
    });
  });

  taskDef.add('effort-analysis', '\nUsage: effort-analysis  [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.effortAnalyser
      .fileAnalysisStream(helpers.filesHelper.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
      .pipe(utils.json.objectArrayToFileStream(helpers.filesHelper.effort()));
  });

  taskDef.add('developer-effort-analysis', '\nUsage: developer-effort-analysis  [--dateFrom <date> --dateTo <date>]', ['effort-analysis'], function() {
    return helpers.reportHelper.publish('developer-effort', function(publisher) {
      return utils.json.fileToObject(helpers.filesHelper.effort()).then(function(data) {
        _.each(['individual', 'team'], function(type) {
          var revisionsData = helpers.developerData.aggregateBy(data, type);
          var tree = helpers.graphDataHelper.tree(revisionsData, 'path');
          utils.json.objectToFile(publisher.addReportFileForType(type + '-effort'), tree);
        });
      });
    });
  });

  taskDef.add('authors-analysis', '\nUsage: authors-analysis  [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.authorsAnalyser
      .fileAnalysisStream(helpers.filesHelper.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
      .pipe(utils.json.objectArrayToFileStream(helpers.filesHelper.authors()));
  });

  taskDef.add('main-dev-analysis', '\nUsage: main-dev-analysis  [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.mainDevAnalyser
      .fileAnalysisStream(helpers.filesHelper.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
      .pipe(utils.json.objectArrayToFileStream(helpers.filesHelper.mainDev()));
  });

  taskDef.add('authors-coupling', '\nUsage: authors-coupling  [--dateFrom <date> --dateTo <date> --maxCoupledFiles <n> [default 5]]', ['authors-analysis', 'main-dev-analysis'], function() {
    var tcAnalysis = codeMaat.temporalCouplingAnalyser
      .fileAnalysisStream(helpers.filesHelper.vcslog(context.dateRange), { '-t': 1 })
      .pipe(filter.obj(function(obj) {
        return context.repository.isValidPath(obj.path) && context.repository.isValidPath(obj.coupledPath);
      }));

    return helpers.reportHelper.publish('authors-coupling', function(publisher) {
      return new reporting.ReportComposer(helpers.filesHelper.authors())
        .mergeWith(helpers.filesHelper.mainDev(), {
          matchStrategy: utils.pathMatchers.haveSamePath,
          mergeStrategy: reporting.MergeStrategies.extension(['mainDev', 'locAdded', 'ownership'])
        })
        .mergeWith(tcAnalysis, {
          matchStrategy: utils.pathMatchers.areCoupled,
          mergeStrategy: function(reportItem, dataSourceItem) {
            reportItem.coupledEntries = reportItem.coupledEntries || [];
            if (reportItem.coupledEntries.length >= (context.parameters.maxCoupledFiles || 5)) { return false; }
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
          utils.json.objectToFile(publisher.addReportFile(), helpers.graphDataHelper.flatWeightedTree(relevantData, 'revisions'));
        });
    });
  });
};
