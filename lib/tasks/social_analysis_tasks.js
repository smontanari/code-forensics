var fs        = require('fs'),
    _         = require('lodash'),
    filter    = require('through2-filter'),
    map       = require('through2-map'),
    pp        = require('../parallel_processing'),
    reporting = require('../reporting'),
    wordCount = require('../analysers/word_count'),
    codeMaat  = require('../analysers/code_maat'),
    utils     = require('../utils');

module.exports = function(taskDef, context, helpers) {
  taskDef.addAnalysisTask('commit-message-analysis',
    {
      description: 'Analyse the frequency of commit message words',
      reportName: 'commit-messages',
      parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'frequency' }, { name: 'minWordCount' }],
      reportFile: 'commit-words-data.json'
    }, ['vcs-commit-messages'], function(publisher) {
    return pp.taskExecutor().processAll(utils.arrays.arrayToFnFactory(context.timePeriods, function(timePeriod) {
      var stream = fs.createReadStream(helpers.files.vcsCommitMessages(timePeriod))
        .pipe(wordCount.analyser.textAnalysisStream(context.commitMessagesFilters))
        .pipe(map.obj(function(wordsArray) {
          return _.filter(wordsArray, function(item) {
            return item.count >= context.parameters.minWordCount;
          });
        }));

      return utils.json.objectToFileStream(publisher.addReportFile(timePeriod), stream);
    }));
  });

  taskDef.addAnalysisTask('developer-effort-analysis',
    {
      description: 'Analyse the distribution of effort (in number of revisions) amongst developers/teams for each file',
      reportName: 'developer-effort',
      parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }],
      reportFiles: {
        'individual-effort': 'developer-effort-data.json',
        'team-effort':       'team-effort-data.json'
      }
    },
    ['effort-report'], function(publisher) {
    return utils.json.fileToObject(helpers.files.effort()).then(function(data) {
      _.each({ individual: 'authors', team: 'teams' }, function(childrenProperty, type) {
        var revisionsData = helpers.developerData.aggregateEffortOwnershipBy(data, type);
        var tree = helpers.graphData.tree(revisionsData, 'path', childrenProperty);
        return utils.json.objectToFile(publisher.addReportFileForType(type + '-effort'), tree);
      });
    });
  });

  taskDef.addAnalysisTask('authors-coupling-analysis',
    {
      description: 'Analyse the coupling between main developers of files with the most authors',
      reportName: 'authors-coupling',
      parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'maxCoupledFiles' }],
      reportFile: 'authors-coupling-data.json'
    }, ['authors-report', 'code-ownership-report'], function(publisher) {
    var tcAnalysis = codeMaat.temporalCouplingAnalyser
      .fileAnalysisStream(helpers.files.vcslog(context.dateRange), { '-t': 1 })
      .pipe(filter.obj(function(obj) {
        return context.repository.isValidPath(obj.path) && context.repository.isValidPath(obj.coupledPath);
      }));

    return utils.json.fileToObject(helpers.files.codeOwnership())
    .then(function(data) {
      var ownershipData = helpers.developerData.aggregateCodeOwnershipBy(data, 'individual');
      return _.reduce(ownershipData, function(array, entry) {
        array.push({
          path: entry.path,
          mainDev: entry.authors[0].name,
          ownership: entry.authors[0].ownership
        });
        return array;
      }, []);
    })
    .then(function(mainDeveloperData) {
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
};
