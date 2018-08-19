/*global require_src*/
var _      = require('lodash'),
    stream = require('stream');

var codeMaatReportTasks = require_src('tasks/code_maat_reports_tasks'),
    codeMaat            = require_src('analysers/code_maat'),
    command             = require_src('command');

describe('CodeMaat report tasks', function() {
  var runtime;

  var assertTaskReport = function(exampleDescription, taskName) {
    describe(taskName, function() {
      it(exampleDescription, function(done) {
        var analysisStream = new stream.PassThrough({ objectMode: true });
        spyOn(codeMaat, 'analyser').and.returnValue(
          {
            fileAnalysisStream: function() { return analysisStream; },
            isSupported: _.stubTrue
          }
        );

        runtime.executePromiseTask(taskName).then(function(taskOutput) {
          taskOutput.assertTempReport(taskName + '.json', [
            { path: 'test_file1', testData: 123 },
            { path: 'test_file2', testData: 456 }
          ]);
          done();
        });

        analysisStream.push({ path: 'test_file1', testData: 123 });
        analysisStream.push({ path: 'test_file2', testData: 456 });
        analysisStream.end();
      });
    });
  };

  var assertMissingTaskReport = function(taskName) {
    describe(taskName, function() {
      it('does not write a report', function(done) {
        spyOn(codeMaat, 'analyser').and.returnValue(
          { isSupported: _.stubFalse }
        );

        runtime.executePromiseTask(taskName).then(function(taskOutput) {
          taskOutput.assertMissingTempReport(taskName + '.json');
          done();
        });
      });
    });
  };

  beforeEach(function() {
    spyOn(command.Command, 'ensure');
    runtime = this.runtimeSetup(codeMaatReportTasks);
  });

  afterEach(function() {
    this.clearRepo();
    this.clearTemp();
  });

  describe('with any supported VCS type', function() {
    assertTaskReport('writes a report on the number of revisions for each valid file', 'revisions-report');
    assertTaskReport('writes a report on the effort distribution for each file', 'effort-report');
    assertTaskReport('writes a report on the number of authors and revisions for each file', 'authors-report');
    assertTaskReport('writes a report on the main developers (by revisions) for each file', 'main-dev-report');
    assertTaskReport('writes a report on the developer ownership (by added lines of code) for each file', 'code-ownership-report');
  });

  describe('with an unsupported VCS type', function() {
    assertMissingTaskReport('revisions-report');
    assertMissingTaskReport('effort-report');
    assertMissingTaskReport('authors-report');
    assertMissingTaskReport('main-dev-report');
    assertMissingTaskReport('code-ownership-report');
  });
});

