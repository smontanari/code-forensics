var Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream'),
    _      = require('lodash');

var systemAnalysisTasks = require_src('tasks/system_analysis_tasks'),
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
    this.clearOutput();
  });

  describe('system-evolution-analysis', function() {
    var revisionsAnalysisStreams = [
      { analysisName: 'revisions', data:
        [
          { path: 'test_layer1', revisions: 32 },
          { path: 'test_layer2', revisions: 47 },
          { path: 'test_layer3', revisions: 15 }
        ]
      },
      {
        analysisName: 'revisions', data:
        [
          { path: 'test_layer1', revisions: 34 },
          { path: 'test_layer2', revisions: 25 },
          { path: 'test_layer3', revisions: 11 }
        ]
      }
    ];

    var churnAnalysisStreams = [
      { analysisName: 'entity-churn', data:
        [
          { path: 'test_layer1', addedLines: 95295, deletedLines: 10209, commits: 203 },
          { path: 'test_layer2', addedLines:  6940, deletedLines:  6961, commits: 944 },
          { path: 'test_layer3', addedLines:   710, deletedLines:    37, commits:  22 }
        ]
      },
      {
        analysisName: 'entity-churn', data:
        [
          { path: 'test_layer1', addedLines: 12091, deletedLines: 10138, commits: 17 },
          { path: 'test_layer2', addedLines:  1147, deletedLines:  1156, commits: 26 },
          { path: 'test_layer3', addedLines:   889, deletedLines:   660, commits: 38 }
        ]
      }
    ];

    var couplingAnalysisStreams = [
      {
        analysisName: 'coupling', data: [
          { path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 23, revisionsAvg: 12 },
          { path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 41, revisionsAvg: 22 },
          { path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 30, revisionsAvg: 5 }
        ]
      },
      {
        analysisName: 'coupling', data: [
          { path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 33, revisionsAvg: 18 },
          { path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 52, revisionsAvg: 32 },
          { path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 10, revisionsAvg: 30 }
        ]
      }
    ];

    var revisionsAnalysisResults = [
      { name: 'test_layer1', revisions: 32, date: '2016-01-31'},
      { name: 'test_layer2', revisions: 47, date: '2016-01-31'},
      { name: 'test_layer3', revisions: 15, date: '2016-01-31'},
      { name: 'test_layer1', revisions: 34, date: '2016-02-28'},
      { name: 'test_layer2', revisions: 25, date: '2016-02-28'},
      { name: 'test_layer3', revisions: 11, date: '2016-02-28'}
    ];

    var churnAnalysisResults = [
      { name: 'test_layer1', addedLines: 95295, deletedLines: 10209, totalLines: 85086, date: '2016-01-31'},
      { name: 'test_layer2', addedLines:  6940, deletedLines:  6961, totalLines:   -21, date: '2016-01-31'},
      { name: 'test_layer3', addedLines:   710, deletedLines:    37, totalLines:   673, date: '2016-01-31'},
      { name: 'test_layer1', addedLines: 12091, deletedLines: 10138, totalLines:  1953, date: '2016-02-28'},
      { name: 'test_layer2', addedLines:  1147, deletedLines:  1156, totalLines:    -9, date: '2016-02-28'},
      { name: 'test_layer3', addedLines:   889, deletedLines:   660, totalLines:   229, date: '2016-02-28'}
    ];

    var couplingAnalysisResults = [
      { name: 'test_layer1', coupledName: 'test_layer2', couplingDegree: 23, date: '2016-01-31'},
      { name: 'test_layer1', coupledName: 'test_layer3', couplingDegree: 41, date: '2016-01-31'},
      { name: 'test_layer2', coupledName: 'test_layer3', couplingDegree: 30, date: '2016-01-31'},
      { name: 'test_layer1', coupledName: 'test_layer2', couplingDegree: 33, date: '2016-02-28'},
      { name: 'test_layer1', coupledName: 'test_layer3', couplingDegree: 52, date: '2016-02-28'},
      { name: 'test_layer2', coupledName: 'test_layer3', couplingDegree: 10, date: '2016-02-28'}
    ];

    var testAnalysis = function(description, taskParameters, streamsInfo, expectedResults) {
      it(description, function(done) {
        var streams = _.map(streamsInfo, function(s) {
          return _.extend({}, s, {
            stream: new stream.PassThrough({ objectMode: true })
          });
        });

        var analyserSpy = _.spread(spyOn(codeMaat, 'analyser').and.returnValues);
        analyserSpy(_.map(streams, function(s) {
          return { fileAnalysisStream: jasmine.createSpy().and.returnValue(s.stream) };
        }));

        var runtime = this.runtimeSetup(systemAnalysisTasks,
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
          _.each(expectedResults.reports, function(r) {
            taskOutput.assertOutputReport(('2016-01-01_2016-02-28_' + r.fileName), r.data);
          });
          taskOutput.assertManifest(expectedResults.manifest);

          done();
        });

        var expectedArgs = _.map(streams, function(s) { return [s.analysisName]; });

        expect(codeMaat.analyser.calls.allArgs()).toEqual(expectedArgs);

        _.each(streams, function(s) {
          _.each(s.data, s.stream.push.bind(s.stream));
          s.stream.end();
        });
      });
    };

    describe('with no layer group parameter', function() {
      testAnalysis(
        'publishes a revisions report and a churn report with data aggregated for all files',
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom' },
        revisionsAnalysisStreams.concat(churnAnalysisStreams),
        {
          reports: [
            {
              fileName: 'system-revisions-data.json',
              data: [
                { name: 'All files', revisions: 94, date: '2016-01-31' },
                { name: 'All files', revisions: 70, date: '2016-02-28' }
              ]
            },
            {
              fileName: 'system-churn-data.json',
              data: [
                { name: 'All files', addedLines: 102945, deletedLines: 17207, totalLines: 85738, date: '2016-01-31' },
                { name: 'All files', addedLines:  14127, deletedLines: 11954, totalLines:  2173, date: '2016-02-28' }
              ]
            }
          ],
          manifest: {
            reportName: 'system-evolution',
            parameters: { timeSplit: 'eom' },
            dateRange: '2016-01-01_2016-02-28',
            enabledDiagrams: ['revisions-trend', 'churn-trend']
          }
        }
      );
    });

    describe('with a layer group parameter', function() {
      testAnalysis(
        'publishes a revisions report, a code churn report and a coupling report for each architectural layer of the system',
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom', layerGroup: 'test_boundary' },
        revisionsAnalysisStreams.concat(churnAnalysisStreams).concat(couplingAnalysisStreams),
        {
          reports: [
            { fileName: 'system-revisions-data.json', data: revisionsAnalysisResults },
            { fileName: 'system-churn-data.json', data: churnAnalysisResults },
            { fileName: 'system-coupling-data.json', data: couplingAnalysisResults }
          ],
          manifest: {
            reportName: 'system-evolution',
            parameters: { timeSplit: 'eom', layerGroup: 'test_boundary' },
            dateRange: '2016-01-01_2016-02-28',
            enabledDiagrams: ['revisions-trend', 'churn-trend', 'coupling-trend']
          }
        }
      );
    });
  });
});
