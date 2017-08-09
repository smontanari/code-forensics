var _      = require('lodash'),
    Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var codeMaatReportTasks = require_src('tasks/code_maat_reports_tasks'),
    codeMaat            = require_src('analysers/code_maat'),
    command             = require_src('command');

describe('CodeMaat report tasks', function() {
  var runtime;

  var assertTaskReport = function(exampleDescription, analysis, taskName, reportFilename) {
    describe(taskName, function() {
      it(exampleDescription, function(done) {
        var analysisStream = new stream.PassThrough({ objectMode: true });
        spyOn(codeMaat, 'analyser').and.returnValue(
          { fileAnalysisStream: function() { return analysisStream; } }
        );

        runtime.executePromiseTask(taskName).then(function(taskOutput) {
          taskOutput.assertTempReport(reportFilename, [
            { path: 'test_file1', testData: 123 },
            { path: 'test_file2', testData: 456 }
          ]);
          done();
        });

        expect(codeMaat.analyser).toHaveBeenCalledWith(analysis);

        analysisStream.push({ path: 'test_file1', testData: 123 });
        analysisStream.push({ path: 'test_file2', testData: 456 });
        analysisStream.push({ path: 'test_invalid_file', testData: 789 });
        analysisStream.end();
      });
    });
  };

  beforeEach(function() {
    spyOn(command.Command, 'ensure');
    runtime = this.runtimeSetup(codeMaatReportTasks, {
      repository: { excludePaths: ['test_invalid_file'] }
    });
    _.each(['test_file1', 'test_file2', 'test_invalid_file'], function(f) {
      runtime.prepareRepositoryFile(f, '');
    });
  });

  afterEach(function() {
    this.clearRepo();
    this.clearTemp();
  });

  assertTaskReport('writes a report on the number of revisions for each valid file', 'revisions', 'revisions-report', 'revisions-report.json');
  assertTaskReport('writes a report on the effort distribution for each file', 'entity-effort', 'effort-report', 'effort-report.json');
  assertTaskReport('writes a report on the number of authors and revisions for each file', 'authors', 'authors-report', 'authors-report.json');
  assertTaskReport('writes a report on the main developers (by revisions) for each file', 'main-dev', 'main-dev-report', 'main-dev-report.json');
  assertTaskReport('writes a report on the developer ownership (by added lines of code) for each file', 'entity-ownership', 'code-ownership-report', 'code-ownership-report.json');
});

