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
    var summaryAnalysisStreams = {
      codeMaatInstruction: 'summary',
      data: [
        {
          period: '2016-01-01_2016-01-31',
          values: [
            { stat: 'revisions', value: 94 },
            { stat: 'files',     value: 34 },
            { stat: 'commits',   value: 67 },
            { stat: 'authors',   value: 14 }
          ]
        },
        {
          period: '2016-02-01_2016-02-28',
          values: [
            { stat: 'revisions', value: 70 },
            { stat: 'files',     value: 26 },
            { stat: 'commits',   value: 52 },
            { stat: 'authors',   value: 9 }
          ]
        }
      ]
    };

    var absChurnAnalysisStreams = {
      codeMaatInstruction: 'abs-churn',
      data: [
        {
          period: '2016-01-01_2016-01-31',
          values: [
            { date: 'not relevant', addedLines: 95295, deletedLines: 10209, commits: 203 },
            { date: 'not relevant', addedLines: 6940, deletedLines: 6961, commits: 944 },
            { date: 'not relevant', addedLines: 710, deletedLines: 37, commits: 22 }
          ]
        },
        {
          period: '2016-02-01_2016-02-28',
          values: [
            { date: 'not relevant', addedLines: 12091, deletedLines: 10138, commits: 17 },
            { date: 'not relevant', addedLines: 1147, deletedLines: 1156, commits: 26 },
            { date: 'not relevant', addedLines: 889, deletedLines: 660, commits: 38 }
          ]
        }
      ]
    };

    var layeredSummaryAnalysisStreams = {
      codeMaatInstruction: 'summary',
      data: [
        {
          period: '2016-01-01_2016-01-31',
          layerGroupFile: 'layer-group-test-layer-1.txt',
          values: [
            { stat: 'revisions', value: 12 },
            { stat: 'commits', value: 42 },
            { stat: 'authors', value: 8 },
            { stat: 'files', value: 6 }
          ],
        },
        {
          period: '2016-01-01_2016-01-31',
          layerGroupFile: 'layer-group-test-layer-2.txt',
          values: [
            { stat: 'revisions', value: 9 },
            { stat: 'commits', value: 21 },
            { stat: 'authors', value: 3 },
            { stat: 'files', value: 4 }
          ],
        },
        {
          period: '2016-01-01_2016-01-31',
          layerGroupFile: 'layer-group-test-layer-3.txt',
          values: [
            { stat: 'revisions', value: 2 },
            { stat: 'commits', value: 5 },
            { stat: 'authors', value: 1 },
            { stat: 'files', value: 1 }
          ],
        },
        {
          period: '2016-02-01_2016-02-28',
          layerGroupFile: 'layer-group-test-layer-1.txt',
          values: [
            { stat: 'revisions', value: 27 },
            { stat: 'commits', value: 59 },
            { stat: 'authors', value: 12 },
            { stat: 'files', value: 17 }
          ],
        },
        {
          period: '2016-02-01_2016-02-28',
          layerGroupFile: 'layer-group-test-layer-2.txt',
          values: [
            { stat: 'revisions', value: 14 },
            { stat: 'commits', value: 30 },
            { stat: 'authors', value: 4 },
            { stat: 'files', value: 5 }
          ],
        },
        {
          period: '2016-02-01_2016-02-28',
          layerGroupFile: 'layer-group-test-layer-3.txt',
          values: [
            { stat: 'revisions', value: 5 },
            { stat: 'commits', value: 3 },
            { stat: 'authors', value: 2 },
            { stat: 'files', value: 2 }
          ],
        }
      ]
    };

    var layeredChurnAnalysisStreams = {
      codeMaatInstruction: 'entity-churn',
      data: [
        {
          period: '2016-01-01_2016-01-31',
          layerGroupFile: 'layer-groups.txt',
          values: [
            { path: 'test_layer1', addedLines: 95295, deletedLines: 10209, commits: 203 },
            { path: 'test_layer2', addedLines:  6940, deletedLines:  6961, commits: 944 },
            { path: 'test_layer3', addedLines:   710, deletedLines:    37, commits:  22 }
          ]
        },
        {
          period: '2016-02-01_2016-02-28',
          layerGroupFile: 'layer-groups.txt',
          values: [
            { path: 'test_layer1', addedLines: 12091, deletedLines: 10138, commits: 17 },
            { path: 'test_layer2', addedLines:  1147, deletedLines:  1156, commits: 26 },
            { path: 'test_layer3', addedLines:   889, deletedLines:   660, commits: 38 }
          ]
        }
      ]
    };

    var layeredCouplingAnalysisStreams = {
      codeMaatInstruction: 'coupling',
      data: [
        {
          period: '2016-01-01_2016-01-31',
          layerGroupFile: 'layer-groups.txt',
          values: [
            { path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 23, revisionsAvg: 12 },
            { path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 41, revisionsAvg: 22 },
            { path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 30, revisionsAvg: 5 }
          ]
        },
        {
          period: '2016-02-01_2016-02-28',
          layerGroupFile: 'layer-groups.txt',
          values: [
            { path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 33, revisionsAvg: 18 },
            { path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 52, revisionsAvg: 32 },
            { path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 10, revisionsAvg: 30 }
          ]
        }
      ]
    };

    var testAnalysis = function(description, taskParameters, analysisStreams, supportedAnalyses, expectedResults) {
      it(description, function(done) {
        var streams = _.map(analysisStreams, function(analysisStream) {
          var streamObjects = _.map(analysisStream.data, function() { return new stream.PassThrough({ objectMode: true }); });
          var mockAnalysisStream = jasmine.createSpy('analysisStream');
          var stubAnalysis = _.spread(mockAnalysisStream.and.returnValues).bind(mockAnalysisStream.and);
          return _.extend({}, analysisStream, {
            streamObjects: streamObjects,
            mockAnalyser: {
              isSupported: function() { return _.includes(supportedAnalyses, analysisStream.codeMaatInstruction); },
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
                { name: 'test_layer1', paths: 'some paths' },
                { name: 'test_layer2', paths: 'some paths' },
                { name: 'test_layer3', paths: 'some paths' },
              ]
            }
          },
          taskParameters
        );

        runtime.executePromiseTask('system-evolution-analysis').then(function(taskOutput) {
          _.each(streams, function(testStream) {
            if (testStream.mockAnalyser.isSupported()) {
              _.each(testStream.data, function(d) {
                if (d.layerGroupFile) {
                  expect(testStream.mockAnalyser.fileAnalysisStream).toHaveBeenCalledWith(jasmine.stringMatching(d.period), jasmine.objectContaining({ '-g': jasmine.stringMatching(d.layerGroupFile) }));
                } else {
                  expect(testStream.mockAnalyser.fileAnalysisStream).toHaveBeenCalledWith(jasmine.stringMatching(d.period), undefined);
                }
              });
            } else {
              expect(testStream.mockAnalyser.fileAnalysisStream).not.toHaveBeenCalled();
            }
          });
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
          _.each(s.data, function(d, index) {
            _.each(d.values, function(v) { s.streamObjects[index].push(v); });
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
              enabledDiagrams: ['revisions-trend', 'commits-trend', 'authors-trend', 'churn-trend']
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
              enabledDiagrams: ['revisions-trend', 'commits-trend', 'authors-trend']
            }
          }
        );
      });
    });

    describe('with a layer group parameter', function() {
      describe('with churn analysis supported by the VCS type', function() {
        testAnalysis(
          'publishes a summary report, a code churn report and a coupling report for each architectural layer of the system',
          { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom', layerGroup: 'test_boundary' },
          [layeredSummaryAnalysisStreams, layeredChurnAnalysisStreams, layeredCouplingAnalysisStreams],
          ['summary', 'entity-churn', 'coupling'],
          {
            reports: [
              {
                fileName: '2016-01-01_2016-02-28_system-summary-data.json',
                data: [
                  {
                    name: 'test_layer1', date: '2016-01-31T12:59:59.999Z',
                    revisions: 12, cumulativeRevisions: 12,
                    commits:   42, cumulativeCommits:   42,
                    authors:    8, cumulativeAuthors:    8
                  },
                  {
                    name: 'test_layer2', date: '2016-01-31T12:59:59.999Z',
                    revisions: 9, cumulativeRevisions: 9,
                    commits:  21, cumulativeCommits:  21,
                    authors:   3, cumulativeAuthors:   3
                  },
                  {
                    name: 'test_layer3', date: '2016-01-31T12:59:59.999Z',
                    revisions: 2, cumulativeRevisions: 2,
                    commits:   5, cumulativeCommits:   5,
                    authors:   1, cumulativeAuthors:   1
                  },
                  {
                    name: 'test_layer1', date: '2016-02-28T12:59:59.999Z',
                    revisions: 27, cumulativeRevisions: 39,
                    commits:   59, cumulativeCommits:  101,
                    authors:   12, cumulativeAuthors:   20
                  },
                  {
                    name: 'test_layer2', date: '2016-02-28T12:59:59.999Z',
                    revisions: 14, cumulativeRevisions: 23,
                    commits:   30, cumulativeCommits:   51,
                    authors:    4, cumulativeAuthors:    7
                  },
                  {
                    name: 'test_layer3', date: '2016-02-28T12:59:59.999Z',
                    revisions: 5, cumulativeRevisions: 7,
                    commits:   3, cumulativeCommits:   8,
                    authors:   2, cumulativeAuthors:   3
                  }
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
              enabledDiagrams: ['revisions-trend', 'commits-trend', 'authors-trend', 'churn-trend', 'coupling-trend']
            }
          }
        );
      });

      describe('with churn analysis not supported by the VCS type', function() {
        testAnalysis(
          'publishes a summary report and a coupling report for each architectural layer of the system',
          { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom', layerGroup: 'test_boundary' },
          [layeredSummaryAnalysisStreams, layeredChurnAnalysisStreams, layeredCouplingAnalysisStreams],
          ['summary', 'coupling'],
          {
            reports: [
              {
                fileName: '2016-01-01_2016-02-28_system-summary-data.json',
                data: [
                  {
                    name: 'test_layer1', date: '2016-01-31T12:59:59.999Z',
                    revisions: 12, cumulativeRevisions: 12,
                    commits: 42, cumulativeCommits: 42,
                    authors: 8, cumulativeAuthors: 8
                  },
                  {
                    name: 'test_layer2', date: '2016-01-31T12:59:59.999Z',
                    revisions: 9, cumulativeRevisions: 9,
                    commits: 21, cumulativeCommits: 21,
                    authors: 3, cumulativeAuthors: 3
                  },
                  {
                    name: 'test_layer3', date: '2016-01-31T12:59:59.999Z',
                    revisions: 2, cumulativeRevisions: 2,
                    commits: 5, cumulativeCommits: 5,
                    authors: 1, cumulativeAuthors: 1
                  },
                  {
                    name: 'test_layer1', date: '2016-02-28T12:59:59.999Z',
                    revisions: 27, cumulativeRevisions: 39,
                    commits: 59, cumulativeCommits: 101,
                    authors: 12, cumulativeAuthors: 20
                  },
                  {
                    name: 'test_layer2', date: '2016-02-28T12:59:59.999Z',
                    revisions: 14, cumulativeRevisions: 23,
                    commits: 30, cumulativeCommits: 51,
                    authors: 4, cumulativeAuthors: 7
                  },
                  {
                    name: 'test_layer3', date: '2016-02-28T12:59:59.999Z',
                    revisions: 5, cumulativeRevisions: 7,
                    commits: 3, cumulativeCommits: 8,
                    authors: 2, cumulativeAuthors: 3
                  }
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
              enabledDiagrams: ['revisions-trend', 'commits-trend', 'authors-trend', 'coupling-trend']
            }
          }
        );
      });
    });
  });
});
