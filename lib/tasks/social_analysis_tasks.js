/*
 * code-forensics
 * Copyright (C) 2016-2021 Silvio Montanari
 * Distributed under the GNU General Public License v3.0
 * see http://www.gnu.org/licenses/gpl.html
 */

var fs            = require('fs'),
    gulp          = require('gulp'),
    _             = require('lodash'),
    filter        = require('through2-filter'),
    map           = require('through2-map'),
    reduce        = require('through2-reduce'),
    pp            = require('../parallel_processing'),
    reporting     = require('../reporting'),
    wordCount     = require('../analysers/word_count'),
    utils         = require('../utils'),
    vcsTasks      = require('./vcs_tasks'),
    codeTasks     = require('./code_analysis_tasks'),
    codeMaatTasks = require('./code_maat_reports_tasks');

module.exports = function(taskDef, context, helpers) {
  var vcsFunctions      = vcsTasks(taskDef, context, helpers).functions,
      codeFunctions     = codeTasks(taskDef, context, helpers).functions,
      codeMaatFunctions = codeMaatTasks(taskDef, context, helpers).functions;

  return {
    tasks: function() {
      taskDef.addAnalysisTask('commit-message-analysis',
        {
          description: 'Analyse the number of occurrencies of commit message words',
          reportName: 'commit-messages',
          parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'timeSplit' }, { name: 'minWordCount' }],
          reportFile: 'commit-words-data.json',
          run: function(publisher) {
            publisher.enableDiagram('commit-words');
            return pp.streamProcessor().processAll(context.timePeriods, function(timePeriod) {
              var stream = fs.createReadStream(helpers.files.vcsCommitMessages(timePeriod))
                .pipe(wordCount.analyser().textAnalysisStream(context.commitMessageFilters))
                .pipe(map.obj(function(wordsArray) {
                  return _.filter(wordsArray, function(item) {
                    return item.count >= context.parameters.minWordCount;
                  });
                }));

              return utils.json.objectToFileStream(publisher.addReportFile(timePeriod), stream);
            });
          }
        }, vcsFunctions.vcsCommitMessages);

      taskDef.addAnalysisTask('developer-effort-analysis',
        {
          description: 'Analyse the distribution of effort (revisions) amongst developers/teams',
          reportName: 'developer-effort',
          parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }],
          reportFiles: {
            'individual-effort': 'developer-effort-data.json',
            'team-effort':       'team-effort-data.json'
          },
          run: function(publisher) {
            return utils.json.fileToObject(helpers.files.effort())
              .then(function(effortReportData) {
                return _.filter(effortReportData, function(item) { return context.repository.fileExists(item.path); });
              })
              .then(function(data) {
                return pp.taskExecutor().runAll([
                  { type: 'individual-effort', aggregateFn: 'aggregateIndividualEffortOwnership', propertyName: 'authors' },
                  { type: 'team-effort', aggregateFn: 'aggregateTeamEffortOwnership', propertyName: 'teams' }
                ], function(report) {
                  var revisionsData = helpers.developerData[report.aggregateFn](data);
                  if (revisionsData) {
                    publisher.enableDiagram(report.type);
                    var tree = helpers.graphData.tree(revisionsData, 'path', report.propertyName);
                    return utils.json.objectToFile(publisher.addReportFileForType(report.type), tree);
                  }
                });
              });
          }
        }, gulp.series(vcsFunctions.vcsLogDump, codeMaatFunctions.effortReport));

      taskDef.addAnalysisTask('developer-coupling-analysis',
        {
          description: 'Analyse the ownership and communication coupling between developers',
          reportName: 'developer-coupling',
          parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }, { name: 'maxCoupledFiles' }],
          reportFiles: {
            'code-ownership':        'main-dev-coupling-data.json',
            'communication-network': 'communication-network-data.json'
          },
          run: function(publisher) {
            var authorsCouplingAnalysis = {
              enabled: helpers.codeMaat.temporalCouplingAnalysis.isSupported() && helpers.codeMaat.codeOwnershipAnalysis.isSupported(),
              fn: function() {
                publisher.enableDiagram('main-developer-coupling');
                var temporalCouplingAnalysis = pp.streamProcessor().read(function() {
                  return helpers.codeMaat
                    .temporalCouplingAnalysis(helpers.files.vcsNormalisedLog(context.dateRange), null, { '-t': 1 })
                    .pipe(filter.obj(function(obj) {
                      return context.repository.fileExists(obj.path) && context.repository.fileExists(obj.coupledPath);
                    }));
                });

                return utils.json.fileToObject(helpers.files.codeOwnership())
                  .then(function(data) {
                    var ownershipData = helpers.developerData.aggregateIndividualCodeOwnership(data);
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
                      .mergeWith(temporalCouplingAnalysis, {
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
                        return utils.json.objectToFile(publisher.addReportFileForType('code-ownership'), helpers.graphData.flatWeightedTree(relevantData, 'revisions'));
                      });
                });
              }
            };

            var authorsCommunicationAnalysis = {
              enabled: helpers.codeMaat.communicationAnalysis.isSupported(),
              fn: function() {
                publisher.enableDiagram('communication-network');
                return pp.streamProcessor().process(function() {
                  return utils.json.objectToFileStream(
                    publisher.addReportFileForType('communication-network'),
                    helpers.codeMaat.communicationAnalysis(helpers.files.vcsNormalisedLog(context.dateRange))
                      .pipe(map.obj(function(entry) {
                        return {
                          developer: context.developersInfo.find(entry.author),
                          coupledDeveloper: context.developersInfo.find(entry.coupledAuthor),
                          sharedCommits: entry.sharedCommits,
                          couplingStrength: entry.couplingStrength
                        };
                      }))
                      .pipe(reduce.obj(function(array, entry) {
                        if (!_.find(array, { 'developer': entry.coupledDeveloper, 'coupledDeveloper': entry.developer })) {
                          array.push(entry);
                        }
                        return array;
                      }, [])));
                });
              }
            };

            return pp.taskExecutor().runAll(
              _.filter([authorsCouplingAnalysis, authorsCommunicationAnalysis], 'enabled'), function(analysis) {
                return analysis.fn();
              }
            );
          }
        }, gulp.series(vcsFunctions.vcsLogDump, gulp.parallel(codeMaatFunctions.authorsReport, codeMaatFunctions.codeOwnershipReport)));

      taskDef.addAnalysisTask('knowledge-map-analysis',
        {
          description: 'Analyse the distribution of knowledge amongst developers/teams for each file',
          reportName: 'knowledge-map',
          parameters: [{ name: 'dateFrom' }, { name: 'dateTo' }],
          reportFile: 'knowledge-map-data.json',
          run: function(publisher) {
            if (helpers.codeMaat.mainDevAnalysis.isSupported()) {
              publisher.enableDiagram('individual-knowledge-map');
              if (context.developersInfo.hasTeamInfo) {
                publisher.enableDiagram('team-knowledge-map');
              }
              return utils.json.fileToObject(helpers.files.mainDeveloper()).then(function(data) {
                var ownershipData = _.map(data, function(entry) {
                  var devInfo = context.developersInfo.find(entry.author);
                  return _.assign(_.pick(entry, ['path', 'addedLines', 'ownership']), {
                    mainDev: devInfo.name, team: devInfo.team
                  });
                });

                return new reporting.ReportComposer(helpers.files.sloc())
                  .mergeWith(ownershipData, {
                    matchStrategy: utils.pathMatchers.haveSamePath,
                    mergeStrategy: reporting.MergeStrategies.extension()
                  })
                  .buildReport().then(function(reportData) {
                    var dataTree = helpers.graphData.tree(reportData, 'path');
                    return utils.json.objectToFile(publisher.addReportFile(), dataTree);
                  });
              });
            }
          }
        }, gulp.parallel(codeFunctions.slocReport, gulp.series(vcsFunctions.vcsLogDump, codeMaatFunctions.mainDevReport)));
    }
  };
};
