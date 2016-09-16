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
        return fs.createReadStream(context.files.temp.vcslogMessages(timePeriod))
          .pipe(wordCount.analyser.textAnalysisStream(context.commitCloudFilters))
          .pipe(utils.json.objectToFileStream(publisher.addReportFile(timePeriod)));
      }));
    });
  });

  taskDef.add('authors-analysis', '\nUsage: authors-analysis  [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.authorsAnalyser
      .fileAnalysisStream(context.files.temp.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
      .pipe(utils.json.objectArrayToFileStream(context.files.temp.authors()));
  });

  taskDef.add('main-dev-analysis', '\nUsage: main-dev-analysis  [--dateFrom <date> --dateTo <date>]', ['vcs-log-dump'], function() {
    return codeMaat.mainDevAnalyser
      .fileAnalysisStream(context.files.temp.vcslog(context.dateRange))
      .pipe(filter.obj(function(obj) { return context.repository.isValidPath(obj.path); }))
      .pipe(utils.json.objectArrayToFileStream(context.files.temp.mainDev()));
  });

  taskDef.add('authors-coupling', '\nUsage: authors-coupling  [--dateFrom <date> --dateTo <date> --maxCoupledFiles <n> [default 5]]', ['authors-analysis', 'main-dev-analysis'], function() {
    var tcAnalysis = codeMaat.temporalCouplingAnalyser
      .fileAnalysisStream(context.files.temp.vcslog(context.dateRange), { '-t': 1 })
      .pipe(filter.obj(function(obj) {
        return context.repository.isValidPath(obj.path) && context.repository.isValidPath(obj.coupledPath);
      }));

    return helpers.reportHelper.publish('authors-coupling', function(publisher) {
      return new reporting.ReportComposer(context.files.temp.authors())
        .mergeWith(context.files.temp.mainDev(), {
          matchStrategy: utils.pathMatchers.haveSamePath,
          mergeStrategy: reporting.MergeStrategies.extension(['mainDev', 'locAdded', 'ownership'])
        })
        .mergeWith(tcAnalysis, {
          matchStrategy: utils.pathMatchers.areCoupled,
          mergeStrategy: function(reportItem, dataSourceItem) {
            reportItem.coupledEntries = reportItem.coupledEntries || [];
            if (reportItem.coupledEntries.length >= context.maxCoupledFiles) { return false; }
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
