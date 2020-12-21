/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "runtime.assertTaskDependencies"] }] */
var stream   = require('stream'),
    _        = require('lodash'),
    lolex    = require('lolex'),
    Bluebird = require('bluebird');

var systemAnalysisTasks = require('tasks/system_analysis/system_analysis_tasks'),
    codeMaat            = require('analysers/code_maat'),
    command             = require('command');

var taskHelpers = require('../../jest_tasks_helpers');

describe('System analysis tasks', function() {
  var clock, runtime;
  beforeEach(function() {
    clock = lolex.install({ now: new Date('2015-10-22T10:00:00.000Z') });
    command.Command.ensure = jest.fn();
  });

  afterEach(function() {
    clock.uninstall();
    return runtime.clear();
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
          period: '2016-02-01_2016-02-29',
          values: [
            { stat: 'revisions', value: 0 },
            { stat: 'files',     value: 0 },
            { stat: 'commits',   value: 0 },
            { stat: 'authors',   value: 0 }
          ]
        },
        {
          period: '2016-03-01_2016-03-31',
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
          period: '2016-02-01_2016-02-29',
          values: [
            { date: 'not relevant', addedLines: 0, deletedLines: 0, commits: 0 },
            { date: 'not relevant', addedLines: 0, deletedLines: 0, commits: 0 },
            { date: 'not relevant', addedLines: 0, deletedLines: 0, commits: 0 }
          ]
        },
        {
          period: '2016-03-01_2016-03-31',
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
          ]
        },
        {
          period: '2016-01-01_2016-01-31',
          layerGroupFile: 'layer-group-test-layer-2.txt',
          values: [
            { stat: 'revisions', value: 9 },
            { stat: 'commits', value: 21 },
            { stat: 'authors', value: 3 },
            { stat: 'files', value: 4 }
          ]
        },
        {
          period: '2016-01-01_2016-01-31',
          layerGroupFile: 'layer-group-test-layer-3.txt',
          values: [
            { stat: 'revisions', value: 2 },
            { stat: 'commits', value: 5 },
            { stat: 'authors', value: 1 },
            { stat: 'files', value: 1 }
          ]
        },
        {
          period: '2016-02-01_2016-02-29',
          layerGroupFile: 'layer-group-test-layer-1.txt',
          values: [
            { stat: 'revisions', value: 0 },
            { stat: 'commits', value: 0 },
            { stat: 'authors', value: 0 },
            { stat: 'files', value: 0 }
          ]
        },
        {
          period: '2016-02-01_2016-02-29',
          layerGroupFile: 'layer-group-test-layer-2.txt',
          values: [
            { stat: 'revisions', value: 0 },
            { stat: 'commits', value: 0 },
            { stat: 'authors', value: 0 },
            { stat: 'files', value: 0 }
          ]
        },
        {
          period: '2016-02-01_2016-02-29',
          layerGroupFile: 'layer-group-test-layer-3.txt',
          values: [
            { stat: 'revisions', value: 0 },
            { stat: 'commits', value: 0 },
            { stat: 'authors', value: 0 },
            { stat: 'files', value: 0 }
          ]
        },
        {
          period: '2016-03-01_2016-03-31',
          layerGroupFile: 'layer-group-test-layer-1.txt',
          values: [
            { stat: 'revisions', value: 27 },
            { stat: 'commits', value: 59 },
            { stat: 'authors', value: 12 },
            { stat: 'files', value: 17 }
          ]
        },
        {
          period: '2016-03-01_2016-03-31',
          layerGroupFile: 'layer-group-test-layer-2.txt',
          values: [
            { stat: 'revisions', value: 14 },
            { stat: 'commits', value: 30 },
            { stat: 'authors', value: 4 },
            { stat: 'files', value: 5 }
          ]
        },
        {
          period: '2016-03-01_2016-03-31',
          layerGroupFile: 'layer-group-test-layer-3.txt',
          values: [
            { stat: 'revisions', value: 5 },
            { stat: 'commits', value: 3 },
            { stat: 'authors', value: 2 },
            { stat: 'files', value: 2 }
          ]
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
          period: '2016-02-01_2016-02-29',
          layerGroupFile: 'layer-groups.txt',
          values: [
            { path: 'test_layer1', addedLines: 0, deletedLines: 0, commits: 0 },
            { path: 'test_layer2', addedLines: 0, deletedLines: 0, commits: 0 },
            { path: 'test_layer3', addedLines: 0, deletedLines: 0, commits: 0 }
          ]
        },
        {
          period: '2016-03-01_2016-03-31',
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
          period: '2016-02-01_2016-02-29',
          layerGroupFile: 'layer-groups.txt',
          values: [
            { path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 0, revisionsAvg: 0 },
            { path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 0, revisionsAvg: 0 },
            { path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 0, revisionsAvg: 0 }
          ]
        },
        {
          period: '2016-03-01_2016-03-31',
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
      it(description, function() {
        return new Bluebird(function(done) {
          var streams = analysisStreams.map(function(analysisStream) {
            var mockAnalysisStream = jest.fn().mockName('analysisStream');
            var streamObjects = analysisStream.data.map(function() {
              var streamObject = new stream.PassThrough({ objectMode: true });
              mockAnalysisStream.mockReturnValueOnce(streamObject);
              return streamObject;
            });
            return _.extend({}, analysisStream, {
              streamObjects: streamObjects,
              mockAnalyser: {
                isSupported: function() { return _.includes(supportedAnalyses, analysisStream.codeMaatInstruction); },
                fileAnalysisStream: mockAnalysisStream
              }
            });
          });

          codeMaat.analyser = jest.fn().mockImplementation(function(instruction) {
            return _.find(streams, { codeMaatInstruction: instruction }).mockAnalyser;
          });

          runtime = taskHelpers.createRuntime('system_analysis_tasks', systemAnalysisTasks,
            {
              layerGroups: {
                'test_boundary': [
                  { name: 'test_layer1', paths: 'some paths' },
                  { name: 'test_layer2', paths: 'some paths' },
                  { name: 'test_layer3', paths: 'some paths' }
                ]
              }
            },
            taskParameters
          );

          runtime.executePromiseTask('system-evolution-analysis')
            .then(function(taskOutput) {
              streams.forEach(function(testStream) {
                if (testStream.mockAnalyser.isSupported()) {
                  testStream.data.forEach(function(d) {
                    if (d.layerGroupFile) {
                      expect(testStream.mockAnalyser.fileAnalysisStream).toHaveBeenCalledWith(expect.stringMatching(d.period), expect.stringMatching(d.layerGroupFile), undefined);
                    } else {
                      expect(testStream.mockAnalyser.fileAnalysisStream).toHaveBeenCalledWith(expect.stringMatching(d.period), undefined, undefined);
                    }
                  });
                } else {
                  expect(testStream.mockAnalyser.fileAnalysisStream).not.toHaveBeenCalled();
                }
              });

            return Bluebird.all(
              expectedResults.reports.map(function(filename) {
                return taskOutput.assertOutputReport(filename);
              }).concat(
                expectedResults.missingReports.map(function(filename) {
                  return taskOutput.assertMissingOutputReport(filename);
                })
              ).concat([
                taskOutput.assertManifest()
              ])
            );
          })
          .then(function() { done(); })
          .catch(done.fail);

          streams.forEach(function(s) {
            s.data.forEach(function(d, index) {
              d.values.forEach(function(v) { s.streamObjects[index].push(v); });
              s.streamObjects[index].end();
            });
          });
        });
      });
    };

    it('has the required dependencies', function() {
      runtime = taskHelpers.createRuntime('system_analysis_tasks', systemAnalysisTasks);

      runtime.assertTaskDependencies('system-evolution-analysis', ['vcsLogDump', 'generateLayerGroupingFiles']);
    });

    describe('with no layer group parameter', function() {
      describe('with churn analysis supported by the VCS type', function() {
        testAnalysis(
          'publishes a summary report and a churn report with data aggregated for all files',
          { dateFrom: '2016-01-01', dateTo: '2016-03-31', timeSplit: 'eom' },
          [summaryAnalysisStreams, absChurnAnalysisStreams],
          ['summary', 'abs-churn'],
          {
            reports: [
              '2016-01-01_2016-03-31_system-summary-data.json',
              '2016-01-01_2016-03-31_system-churn-data.json'
            ],
            missingReports: [
              '2016-01-01_2016-03-31_system-coupling-data.json'
            ]
          }
        );
      });

      describe('with churn analysis not supported by the VCS type', function() {
        testAnalysis(
          'publishes a revisions report with data aggregated for all files',
          { dateFrom: '2016-01-01', dateTo: '2016-03-31', timeSplit: 'eom' },
          [summaryAnalysisStreams, absChurnAnalysisStreams],
          ['summary'],
          {
            reports: [
              '2016-01-01_2016-03-31_system-summary-data.json'
            ],
            missingReports: [
              '2016-01-01_2016-03-31_system-coupling-data.json',
              '2016-01-01_2016-03-31_system-churn-data.json'
            ]
          }
        );
      });
    });

    describe('with a layer group parameter', function() {
      describe('with churn analysis supported by the VCS type', function() {
        testAnalysis(
          'publishes a summary report, a code churn report and a coupling report for each architectural layer of the system',
          { dateFrom: '2016-01-01', dateTo: '2016-03-31', timeSplit: 'eom', layerGroup: 'test_boundary' },
          [layeredSummaryAnalysisStreams, layeredChurnAnalysisStreams, layeredCouplingAnalysisStreams],
          ['summary', 'entity-churn', 'coupling'],
          {
            reports: [
              '2016-01-01_2016-03-31_system-summary-data.json',
              '2016-01-01_2016-03-31_system-churn-data.json',
              '2016-01-01_2016-03-31_system-coupling-data.json'
            ],
            missingReports: []
          }
        );
      });

      describe('with churn analysis not supported by the VCS type', function() {
        testAnalysis(
          'publishes a summary report and a coupling report for each architectural layer of the system',
          { dateFrom: '2016-01-01', dateTo: '2016-03-31', timeSplit: 'eom', layerGroup: 'test_boundary' },
          [layeredSummaryAnalysisStreams, layeredChurnAnalysisStreams, layeredCouplingAnalysisStreams],
          ['summary', 'coupling'],
          {
            reports: [
              '2016-01-01_2016-03-31_system-summary-data.json',
              '2016-01-01_2016-03-31_system-coupling-data.json'
            ],
            missingReports: [
              '2016-01-01_2016-03-31_system-churn-data.json'
            ]
          }
        );
      });
    });
  });
});
