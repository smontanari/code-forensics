/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "taskOutput.assert*", "runtime.assert*"] }] */
var Bluebird = require('bluebird'),
    lolex    = require('lolex'),
    stream   = require('stream');

var couplingAnalysisTasks = require('tasks/coupling_analysis_tasks'),
    codeMaat              = require('analysers/code_maat'),
    command               = require('command');

var taskHelpers = require('../jest_tasks_helpers');

describe('Coupling analysis tasks', function() {
  var runtime, clock;

  beforeEach(function() {
    clock = lolex.install({ now: new Date('2015-10-22T10:00:00.000Z') });
    command.Command.ensure = jest.fn();
  });

  afterEach(function() {
    clock.uninstall();
    return runtime.clear();
  });

  describe('sum-of-coupling-analysis', function() {
    beforeEach(function() {
      runtime = taskHelpers.createRuntime('coupling_analysis_tasks', couplingAnalysisTasks,
        { repository: { excludePaths: ['test_invalid_file'] } },
        { dateFrom: '2015-03-01' }
      );
      ['test_file1', 'test_file2', 'test_invalid_file'].forEach(function(f) {
        runtime.prepareRepositoryFile(f, '');
      });
    });

    it('has the required dependencies', function() {
      runtime.assertTaskDependencies('sum-of-coupling-analysis', ['vcsLogDump']);
    });

    it('publishes a report on the sum of coupling for each file', function() {
      return new Bluebird(function(done) {
        var analysisStream = new stream.PassThrough({ objectMode: true });
        codeMaat.analyser = jest.fn().mockReturnValue(
          { fileAnalysisStream: function() { return analysisStream; } }
        );

        runtime.executePromiseTask('sum-of-coupling-analysis').then(function(taskOutput) {
          return Bluebird.all([
            taskOutput.assertOutputReport('2015-03-01_2015-10-22_sum-of-coupling-data.json'),
            taskOutput.assertManifest()
          ]);
        })
        .then(function() { done(); })
        .catch(done.fail);

        expect(codeMaat.analyser).toHaveBeenCalledWith('soc');
        analysisStream.push({ path: 'test_file1', soc: 34 });
        analysisStream.push({ path: 'test_file2', soc: 62 });
        analysisStream.push({ path: 'test_invalid_file', soc: 23 });
        analysisStream.end();
      });
    });
  });

  describe('temporal-coupling-analysis', function() {
    var couplingStreamsData = [
      [
        { path: 'test/a/file1', coupledPath: 'test/target_file', couplingDegree: 23, revisionsAvg: 12 },
        { path: 'test/b/file2', coupledPath: 'test/a/file1', couplingDegree: 41, revisionsAvg: 22 },
        { path: 'test/target_file', coupledPath: 'test/c/file3', couplingDegree: 30, revisionsAvg: 5 }
      ],
      [
        { path: 'test/b/file2', coupledPath: 'test/a/file1', couplingDegree: 21, revisionsAvg: 12 },
        { path: 'test/a/file1', coupledPath: 'test/c/file3', couplingDegree: 10, revisionsAvg: 5 }
      ],
      [
        { path: 'test/d/file4', coupledPath: 'test/target_file', couplingDegree: 33, revisionsAvg: 18 },
        { path: 'test/c/file3', coupledPath: 'test/b/file2', couplingDegree: 52, revisionsAvg: 32 },
        { path: 'test/target_file', coupledPath: 'test/a/file1', couplingDegree: 10, revisionsAvg: 30 }
      ]
    ];

    var churnStreamsData = [
      [
        { path: 'test/a/file1', addedLines: 295, deletedLines: 209, commits: 20 },
        { path: 'test/b/file2', addedLines:  40, deletedLines:  61, commits:  4 },
        { path: 'test/target_file', addedLines: 150, deletedLines: 60, commits:  31 },
        { path: 'test/c/file3', addedLines:  71, deletedLines:  37, commits: 12 }
      ],
      [
        { path: 'test/c/file3', addedLines:  91, deletedLines: 38, commits: 7 },
        { path: 'test/a/file1', addedLines: 147, deletedLines: 56, commits: 6 },
        { path: 'test/b/file2', addedLines:  19, deletedLines:  6, commits: 3 }
      ],
      [
        { path: 'test/target_file', addedLines: 50, deletedLines: 10, commits:  13 },
        { path: 'test/d/file4', addedLines:  91, deletedLines: 38, commits: 7 },
        { path: 'test/a/file1', addedLines: 147, deletedLines: 56, commits: 6 },
        { path: 'test/b/file2', addedLines:  19, deletedLines:  6, commits: 3 }
      ]
    ];

    beforeEach(function() {
      runtime = taskHelpers.createRuntime('coupling_analysis_tasks', couplingAnalysisTasks,
        {},
        { dateFrom: '2016-01-01', dateTo: '2016-03-31', timeSplit: 'eom', targetFile: 'test/target_file' }
      );

      runtime.prepareTempReport('sloc-report.json', [
        { path: 'test/a/file1', sourceLines: 33, totalLines: 35 },
        { path: 'test/b/file2', sourceLines: 23, totalLines: 28 },
        { path: 'test/c/file3', sourceLines: 15, totalLines: 21 },
        { path: 'test/d/file4', sourceLines: 25, totalLines: 35 },
        { path: 'test/target_file', sourceLines: 55, totalLines: 62 }
      ]);
    });

    it('has the required dependencies', function() {
      runtime.assertTaskDependencies('temporal-coupling-analysis', ['vcsLogDump', 'slocReport']);
    });

    it('publishes as many reports as the given time periods with coupling information between each file and a target file', function() {
      return new Bluebird(function(done) {
        var couplingStreams = [
          new stream.PassThrough({ objectMode: true }),
          new stream.PassThrough({ objectMode: true }),
          new stream.PassThrough({ objectMode: true })
        ];
        var churnStreams = [
          new stream.PassThrough({ objectMode: true }),
          new stream.PassThrough({ objectMode: true }),
          new stream.PassThrough({ objectMode: true })
        ];

        var couplingAnalysisIndex = 0,
            churnAnalysisIndex    = 0;

        codeMaat.analyser = jest.fn().mockImplementation(function(analysis) {
          if (analysis === 'coupling') {
            return { fileAnalysisStream: jest.fn().mockReturnValueOnce(couplingStreams[couplingAnalysisIndex++]) };
          }
          if (analysis === 'entity-churn') {
            return { fileAnalysisStream: jest.fn().mockReturnValueOnce(churnStreams[churnAnalysisIndex++]) };
          }
        });

        runtime.executePromiseTask('temporal-coupling-analysis')
          .then(function(taskOutput) {
            return Bluebird.all([
              taskOutput.assertOutputReport('2016-01-01_2016-01-31_temporal-coupling-data.json'),
              taskOutput.assertOutputReport('2016-03-01_2016-03-31_temporal-coupling-data.json'),
              taskOutput.assertMissingOutputReport('2016-02-01_2016-02-29_temporal-coupling-data.json'),
              taskOutput.assertManifest()
            ]);
          })
          .then(function() { done(); })
          .catch(done.fail);

        couplingStreams.forEach(function(s, index) {
          couplingStreamsData[index].forEach(s.push.bind(s));
          s.end();
        });
        churnStreams.forEach(function(s, index) {
          churnStreamsData[index].forEach(s.push.bind(s));
          s.end();
        });
      });
    });
  });
});
