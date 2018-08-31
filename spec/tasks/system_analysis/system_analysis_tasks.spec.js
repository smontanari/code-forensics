/*eslint-disable max-lines*/
/*global require_src cfHelpers*/
var stream   = require('stream'),
    _        = require('lodash'),
    Bluebird = require('bluebird');

var systemAnalysisTasks = require_src('tasks/system_analysis/system_analysis_tasks'),
    codeMaat            = require_src('analysers/code_maat'),
    command             = require_src('command');

describe('System analysis tasks', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
    spyOn(command.Command, 'ensure');
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    cfHelpers.clearOutput();
  });

  describe('system-evolution-analysis', function() {
    var layeredRevisionsAnalysisStreams = {
      codeMaatInstruction: 'revisions',
      data: [
        [
          { path: 'test_layer1', revisions: 32 },
          { path: 'test_layer2', revisions: 47 },
          { path: 'test_layer3', revisions: 15 }
        ],
        [
          { path: 'test_layer1', revisions: 34 },
          { path: 'test_layer2', revisions: 25 },
          { path: 'test_layer3', revisions: 11 }
        ]
      ]
    };

    var summaryAnalysisStreams = {
      codeMaatInstruction: 'summary',
      data: [
        [
          { stat: 'revisions', value: 94 },
          { stat: 'files',     value: 34 },
          { stat: 'commits',   value: 67 },
          { stat: 'authors',   value: 14 }
        ],
        [
          { stat: 'revisions', value: 70 },
          { stat: 'files',     value: 26 },
          { stat: 'commits',   value: 52 },
          { stat: 'authors',   value: 9 }
        ]
      ]
    };

    var absChurnAnalysisStreams = {
      codeMaatInstruction: 'abs-churn',
      data: [
        [
          { date: 'not relevant', addedLines: 95295, deletedLines: 10209, commits: 203 },
          { date: 'not relevant', addedLines: 6940, deletedLines: 6961, commits: 944 },
          { date: 'not relevant', addedLines: 710, deletedLines: 37, commits: 22 }
        ],
        [
          { date: 'not relevant', addedLines: 12091, deletedLines: 10138, commits: 17 },
          { date: 'not relevant', addedLines: 1147, deletedLines: 1156, commits: 26 },
          { date: 'not relevant', addedLines: 889, deletedLines: 660, commits: 38 }
        ]
      ]
    };

    var layeredChurnAnalysisStreams = {
      codeMaatInstruction: 'entity-churn',
      data: [
        [
          { path: 'test_layer1', addedLines: 95295, deletedLines: 10209, commits: 203 },
          { path: 'test_layer2', addedLines:  6940, deletedLines:  6961, commits: 944 },
          { path: 'test_layer3', addedLines:   710, deletedLines:    37, commits:  22 }
        ],
        [
          { path: 'test_layer1', addedLines: 12091, deletedLines: 10138, commits: 17 },
          { path: 'test_layer2', addedLines:  1147, deletedLines:  1156, commits: 26 },
          { path: 'test_layer3', addedLines:   889, deletedLines:   660, commits: 38 }
        ]
      ]
    };

    var couplingAnalysisStreams = {
      codeMaatInstruction: 'coupling',
      data: [
        [
          { path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 23, revisionsAvg: 12 },
          { path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 41, revisionsAvg: 22 },
          { path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 30, revisionsAvg: 5 }
        ],
        [
          { path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 33, revisionsAvg: 18 },
          { path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 52, revisionsAvg: 32 },
          { path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 10, revisionsAvg: 30 }
        ]
      ]
    };

    var testAnalysis = function(description, taskParameters, analysisStreams, supportedAnalyses, expectedResults) {
      it(description, function(done) {
        var streams = _.map(analysisStreams, function(s) {
          var streamObjects = _.map(s.data, function() { return new stream.PassThrough({ objectMode: true }); });
          var spyStrategy = jasmine.createSpy().and;
          var stubAnalysis = _.spread(spyStrategy.returnValues).bind(spyStrategy);
          return _.extend({}, s, {
            streamObjects: streamObjects,
            mockAnalyser: {
              isSupported: function() { return _.includes(supportedAnalyses, s.codeMaatInstruction); },
              fileAnalysisStream: stubAnalysis(streamObjects)
            }
          });
        });

        spyOn(codeMaat, 'analyser').and.callFake(function(instruction) {
          return _.find(streams, { codeMaatInstruction: instruction }).mockAnalyser;
        });

        var runtime = cfHelpers.runtimeSetup(systemAnalysisTasks,
          {
            layerGroups: {
              'test_boundary': [
                { name: 'Test Layer1', paths: ['test/path1', 'test_path2'] },
                { name: 'Test Layer2', paths: ['test_path3'] }
              ]
            }
          },
          taskParameters
        );

        runtime.executePromiseTask('system-evolution-analysis').then(function(taskOutput) {
          return Bluebird.all(
            _.map(expectedResults.reports, function(r) {
              return taskOutput.assertOutputReport(r.fileName, r.data);
            }).concat(
              _.map(expectedResults.missingReports, function(r) {
                return taskOutput.assertMissingOutputReport(r.fileName);
              })
            )
          ).then(function() {
            return taskOutput.assertManifest(expectedResults.manifest);
          });
        }).then(done);

        _.each(streams, function(s) {
          _.each(s.data, function(values, index) {
            _.each(values, function(v) { s.streamObjects[index].push(v); });
            s.streamObjects[index].end();
          });
        });
      });
    };

    it('has the required dependencies', function() {
      var runtime = cfHelpers.runtimeSetup(systemAnalysisTasks);

      runtime.assertTaskDependencies('system-evolution-analysis', ['vcsLogDump', 'generateLayerGroupingFiles']);
    });

    describe('with no layer group parameter', function() {
      describe('with churn analysis supported by the VCS type', function() {
        testAnalysis(
          'publishes a summary report and a churn report with data aggregated for all files',
          { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom' },
          [summaryAnalysisStreams, absChurnAnalysisStreams],
          ['summary', 'abs-churn'],
          {
            reports: [
              {
                fileName: '2016-01-01_2016-02-28_system-summary-data.json',
                data: [
                  {
                    name: 'All files',
                    revisions: 94, cumulativeRevisions: 94,
                    commits: 67, cumulativeCommits: 67,
                    authors: 14, cumulativeAuthors: 14,
                    date: '2016-01-31T12:59:59.999Z'
                  },
                  {
                    name: 'All files',
                    revisions: 70, cumulativeRevisions: 164,
                    commits: 52, cumulativeCommits: 119,
                    authors: 9, cumulativeAuthors:  23,
                    date: '2016-02-28T12:59:59.999Z'
                  }
                ]
              },
              {
                fileName: '2016-01-01_2016-02-28_system-churn-data.json',
                data: [
                  { name: 'All files', addedLines: 102945, deletedLines: 17207, totalLines: 85738, cumulativeLines: 85738, date: '2016-01-31T12:59:59.999Z' },
                  { name: 'All files', addedLines:  14127, deletedLines: 11954, totalLines:  2173, cumulativeLines: 87911, date: '2016-02-28T12:59:59.999Z' }
                ]
              }
            ],
            missingReports: [
              { fileName: '2016-01-01_2016-02-28_system-coupling-data.json' }
            ],
            manifest: {
              reportName: 'system-evolution',
              parameters: { timeSplit: 'eom' },
              dateRange: '2016-01-01_2016-02-28',
              enabledDiagrams: ['stats-trend', 'churn-trend']
            }
          }
        );
      });

      describe('with churn analysis not supported by the VCS type', function() {
        testAnalysis(
          'publishes a revisions report with data aggregated for all files',
          { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom' },
          [summaryAnalysisStreams, absChurnAnalysisStreams],
          ['summary'],
          {
            reports: [
              {
                fileName: '2016-01-01_2016-02-28_system-summary-data.json',
                data: [
                  {
                    name: 'All files',
                    revisions: 94, cumulativeRevisions:  94,
                    commits: 67, cumulativeCommits: 67,
                    authors: 14, cumulativeAuthors: 14,
                    date: '2016-01-31T12:59:59.999Z'
                  },
                  {
                    name: 'All files',
                    revisions: 70, cumulativeRevisions: 164,
                    commits: 52, cumulativeCommits: 119,
                    authors: 9, cumulativeAuthors: 23,
                    date: '2016-02-28T12:59:59.999Z'
                  }
                ]
              }
            ],
            missingReports: [
              { fileName: '2016-01-01_2016-02-28_system-coupling-data.json' },
              { fileName: '2016-01-01_2016-02-28_system-churn-data.json' }
            ],
            manifest: {
              reportName: 'system-evolution',
              parameters: { timeSplit: 'eom' },
              dateRange: '2016-01-01_2016-02-28',
              enabledDiagrams: ['stats-trend']
            }
          }
        );
      });
    });

    describe('with a layer group parameter', function() {
      describe('with churn analysis supported by the VCS type', function() {
        testAnalysis(
          'publishes a revisions report, a code churn report and a coupling report for each architectural layer of the system',
          { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom', layerGroup: 'test_boundary' },
          [layeredRevisionsAnalysisStreams, layeredChurnAnalysisStreams, couplingAnalysisStreams],
          ['revisions', 'entity-churn', 'coupling'],
          {
            reports: [
              {
                fileName: '2016-01-01_2016-02-28_system-summary-data.json',
                data: [
                  { name: 'test_layer1', revisions: 32, cumulativeRevisions: 32, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer2', revisions: 47, cumulativeRevisions: 47, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer3', revisions: 15, cumulativeRevisions: 15, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer1', revisions: 34, cumulativeRevisions: 66, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer2', revisions: 25, cumulativeRevisions: 72, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer3', revisions: 11, cumulativeRevisions: 26, date: '2016-02-28T12:59:59.999Z'}
                ]
              },
              {
                fileName: '2016-01-01_2016-02-28_system-churn-data.json',
                data: [
                  { name: 'test_layer1', addedLines: 95295, deletedLines: 10209, totalLines: 85086, cumulativeLines: 85086, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer2', addedLines:  6940, deletedLines:  6961, totalLines:   -21, cumulativeLines:   -21, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer3', addedLines:   710, deletedLines:    37, totalLines:   673, cumulativeLines:   673, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer1', addedLines: 12091, deletedLines: 10138, totalLines:  1953, cumulativeLines: 87039, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer2', addedLines:  1147, deletedLines:  1156, totalLines:    -9, cumulativeLines:   -30, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer3', addedLines:   889, deletedLines:   660, totalLines:   229, cumulativeLines:   902, date: '2016-02-28T12:59:59.999Z'}
                ]
              },
              {
                fileName: '2016-01-01_2016-02-28_system-coupling-data.json',
                data: [
                  { name: 'test_layer1', coupledName: 'test_layer2', couplingDegree: 23, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer1', coupledName: 'test_layer3', couplingDegree: 41, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer2', coupledName: 'test_layer3', couplingDegree: 30, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer1', coupledName: 'test_layer2', couplingDegree: 33, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer1', coupledName: 'test_layer3', couplingDegree: 52, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer2', coupledName: 'test_layer3', couplingDegree: 10, date: '2016-02-28T12:59:59.999Z'}
                ]
              }
            ],
            manifest: {
              reportName: 'system-evolution',
              parameters: { timeSplit: 'eom', layerGroup: 'test_boundary' },
              dateRange: '2016-01-01_2016-02-28',
              enabledDiagrams: ['stats-trend', 'churn-trend', 'coupling-trend']
            }
          }
        );
      });

      describe('with churn analysis not supported by the VCS type', function() {
        testAnalysis(
          'publishes a revisions report and a coupling report for each architectural layer of the system',
          { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom', layerGroup: 'test_boundary' },
          [layeredRevisionsAnalysisStreams, layeredChurnAnalysisStreams, couplingAnalysisStreams],
          ['revisions', 'coupling'],
          {
            reports: [
              {
                fileName: '2016-01-01_2016-02-28_system-summary-data.json',
                data: [
                  { name: 'test_layer1', revisions: 32, cumulativeRevisions: 32, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer2', revisions: 47, cumulativeRevisions: 47, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer3', revisions: 15, cumulativeRevisions: 15, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer1', revisions: 34, cumulativeRevisions: 66, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer2', revisions: 25, cumulativeRevisions: 72, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer3', revisions: 11, cumulativeRevisions: 26, date: '2016-02-28T12:59:59.999Z'}
                ]
              },
              {
                fileName: '2016-01-01_2016-02-28_system-coupling-data.json',
                data: [
                  { name: 'test_layer1', coupledName: 'test_layer2', couplingDegree: 23, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer1', coupledName: 'test_layer3', couplingDegree: 41, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer2', coupledName: 'test_layer3', couplingDegree: 30, date: '2016-01-31T12:59:59.999Z'},
                  { name: 'test_layer1', coupledName: 'test_layer2', couplingDegree: 33, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer1', coupledName: 'test_layer3', couplingDegree: 52, date: '2016-02-28T12:59:59.999Z'},
                  { name: 'test_layer2', coupledName: 'test_layer3', couplingDegree: 10, date: '2016-02-28T12:59:59.999Z'}
                ]
              }
            ],
            missingReports: [
              { fileName: '2016-01-01_2016-02-28_system-churn-data.json' }
            ],
            manifest: {
              reportName: 'system-evolution',
              parameters: { timeSplit: 'eom', layerGroup: 'test_boundary' },
              dateRange: '2016-01-01_2016-02-28',
              enabledDiagrams: ['stats-trend', 'coupling-trend']
            }
          }
        );
      });
    });
  });
});
