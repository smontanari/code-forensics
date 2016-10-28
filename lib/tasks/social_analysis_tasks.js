var fs        = require('fs'),
    _         = require('lodash'),
    filter    = require('through2-filter'),
    pp        = require('../parallel_processing'),
    reporting = require('../reporting'),
    wordCount = require('../analysers/word_count'),
    codeMaat  = require('../analysers/code_maat'),
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.add('commit-message-analysis', 'Report the frequency of commit message words\nUsage: commit-cloud [--dateFrom <date> --dateTo <date> --frequency <freq>]', ['vcs-commit-messages'], function() {
    return helpers.report.publish('commit-word-cloud', function(publisher) {
      return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(timePeriod) {
        var stream = fs.createReadStream(helpers.files.vcsCommitMessages(timePeriod))
          .pipe(wordCount.analyser.textAnalysisStream(context.commitMessagesFilters));

        return utils.json.objectToFileStream(publisher.addReportFile(timePeriod), stream);
      }));
    });
  });

  taskDef.add('developer-effort-analysis', 'Report on the distribution of effort (in number of revisions) amongst developers/teams for each file\nUsage: developer-effort-analysis  [--dateFrom <date> --dateTo <date>]', ['effort-report'], function() {
    return helpers.report.publish('developer-effort', function(publisher) {
      return utils.json.fileToObject(helpers.files.effort()).then(function(data) {
        _.each({ individual: 'authors', team: 'teams' }, function(childrenProperty, type) {
          var revisionsData = helpers.developerData.aggregateEffortOwnershipBy(data, type);
          var tree = helpers.graphData.tree(revisionsData, 'path', childrenProperty);
          return utils.json.objectToFile(publisher.addReportFileForType(type + '-effort'), tree);
        });
      });
    });
  });

  taskDef.add('authors-coupling-analysis', 'Report the coupling between main developers of files with the most authors\nUsage: authors-coupling  [--dateFrom <date> --dateTo <date> --maxCoupledFiles <n> [default 5]]', ['authors-report', 'code-ownership-report'], function() {
    var tcAnalysis = codeMaat.temporalCouplingAnalyser
      .fileAnalysisStream(helpers.files.vcslog(context.dateRange), { '-t': 1 })
      .pipe(filter.obj(function(obj) {
        return context.repository.isValidPath(obj.path) && context.repository.isValidPath(obj.coupledPath);
      }));

    return helpers.report.publish('authors-coupling', function(publisher) {
      return utils.json.fileToObject(helpers.files.codeOwnership()).then(function(data) {
        var ownershipData = helpers.developerData.aggregateCodeOwnershipBy(data, 'individual');
        return _.reduce(ownershipData, function(array, entry) {
          array.push({
            path: entry.path,
            mainDev: entry.authors[0].name,
            ownership: entry.authors[0].ownership
          });
          return array;
        }, []);
      }).then(function(mainDeveloperData) {
        return new reporting.ReportComposer(helpers.files.authors())
          .mergeWith(mainDeveloperData, {
            matchStrategy: utils.pathMatchers.haveSamePath,
            mergeStrategy: reporting.MergeStrategies.extension(['mainDev', 'ownership'])
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
  });
};
