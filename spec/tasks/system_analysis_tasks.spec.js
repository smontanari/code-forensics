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
  });

  describe('system-evolution-analysis', function() {
    var assertTaskReport = function(file, content) {
      var reportContent = fs.readFileSync(file);
      var report = JSON.parse(reportContent.toString());
      expect(report).toEqual(content);
    };

    var revisionsAnalysisStreams = [
      { name: 'revisions', data:
        [
          { path: 'test_layer1', revisions: 32 },
          { path: 'test_layer2', revisions: 47 },
          { path: 'test_layer3', revisions: 15 }
        ]
      },
      {
        name: 'revisions', data:
        [
          { path: 'test_layer1', revisions: 34 },
          { path: 'test_layer2', revisions: 25 },
          { path: 'test_layer3', revisions: 11 }
        ]
      }
    ];

    var couplingAnalysisStreams = [
      {
        name: 'coupling', data: [
          { path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 23, revisionsAvg: 12 },
          { path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 41, revisionsAvg: 22 },
          { path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 30, revisionsAvg: 5 }
        ]
      },
      {
        name: 'coupling', data: [
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

        var taskFunctions = this.tasksSetup(systemAnalysisTasks,
          {
            architecturalBoundaries: {
              'test_boundary': [
                { name: 'Test Layer1', paths: ['test/path1', 'test_path2'] },
                { name: 'Test Layer2', paths: ['test_path3'] }
              ]
            }
          },
          taskParameters
        );
        var outputDir = this.tasksWorkingFolders.outputDir;

        taskFunctions['system-evolution-analysis']().then(function() {
          _.each(expectedResults, function(r) {
            assertTaskReport(
              Path.join(outputDir, '376716484935bc38610b095a36fabbe9c01527ad', '2016-01-01_2016-02-28_' + r.fileName),
              r.data
            );
          });

          done();
        });

        var expectedArgs = _.map(streams, function(s) { return [s.name]; });

        expect(codeMaat.analyser.calls.allArgs()).toEqual(expectedArgs);

        _.each(streams, function(s) {
          _.each(s.data, s.stream.push.bind(s.stream));
          s.stream.end();
        });
      });
    };

    describe('with no boundary parameter', function() {
      testAnalysis(
        'publishes a revisions report only',
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', frequency: 'monthly' },
        revisionsAnalysisStreams,
        [{ fileName: 'system-revisions-data.json', data: [
          { name: 'All files', revisions: 94, date: '2016-01-31' },
          { name: 'All files', revisions: 70, date: '2016-02-28' }
        ]}]
      );
    });

    describe('with a boundary parameter', function() {
      testAnalysis(
        'publishes a revisions report and a coupling report for each architectural layer of the system',
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', frequency: 'monthly', boundary: 'test_boundary' },
        revisionsAnalysisStreams.concat(couplingAnalysisStreams),
        [
          { fileName: 'system-revisions-data.json', data: revisionsAnalysisResults },
          { fileName: 'system-coupling-data.json', data: couplingAnalysisResults }
        ]
      );
    });
  });
});
