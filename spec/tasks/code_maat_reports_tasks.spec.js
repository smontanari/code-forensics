/*global require_src cfHelpers*/
var _      = require('lodash'),
    stream = require('stream');

var codeMaatReportTasks = require_src('tasks/code_maat_reports_tasks'),
    codeMaat            = require_src('analysers/code_maat'),
    command             = require_src('command');

describe('CodeMaat report tasks', function() {
  var runtime;

  var assertOutput = function(taskName, taskOutput) {
    return taskOutput.assertTempReport(taskName + '.json', [
      { path: 'test_file1', testData: 123 },
      { path: 'test_file2', testData: 456 }
    ]);
  };

  var assertReport = function(exampleDescription, taskName, functionName) {
    describe(taskName, function() {
      var analysisStream;

      beforeEach(function() {
        analysisStream = new stream.PassThrough({ objectMode: true });
        spyOn(codeMaat, 'analyser').and.returnValue(
          {
            fileAnalysisStream: function() { return analysisStream; },
            isSupported: _.stubTrue
          }
        );
      });

      describe('as a Task', function() {
        it(exampleDescription, function(done) {
          runtime.executePromiseTask(taskName)
            .then(_.wrap(taskName, assertOutput))
            .then(done)
            .catch(done.fail);

          analysisStream.push({ path: 'test_file1', testData: 123 });
          analysisStream.push({ path: 'test_file2', testData: 456 });
          analysisStream.end();
        });
      });

      describe('as a Function', function() {
        it(exampleDescription, function(done) {
          runtime.executePromiseFunction(functionName)
            .then(_.wrap(taskName, assertOutput))
            .then(done)
            .catch(done.fail);

          analysisStream.push({ path: 'test_file1', testData: 123 });
          analysisStream.push({ path: 'test_file2', testData: 456 });
          analysisStream.end();
        });
      });
    });
  };

  var assertMissingReport = function(taskName, functionName) {
    describe(taskName, function() {
      beforeEach(function() {
        spyOn(codeMaat, 'analyser').and.returnValue(
          { isSupported: _.stubFalse }
        );
      });

      describe('as a Task', function() {
        it('does not write a report', function() {
          return runtime.executePromiseTask(taskName).then(function(taskOutput) {
            return taskOutput.assertMissingTempReport(taskName + '.json');
          });
        });
      });

      describe('as a Function', function() {
        it('does not write a report', function() {
          return runtime.executePromiseFunction(functionName).then(function(taskOutput) {
            return taskOutput.assertMissingTempReport(taskName + '.json');
          });
        });
      });
    });
  };

  beforeEach(function() {
    spyOn(command.Command, 'ensure');
    runtime = cfHelpers.runtimeSetup(codeMaatReportTasks);
  });

  afterEach(function() {
    cfHelpers.clearRepo();
    cfHelpers.clearTemp();
  });

  describe('task dependencies', function() {
    _.each(['revisions-report', 'effort-report', 'authors-report', 'main-dev-report', 'code-ownership-report'], function(taskName) {
      it('has the required dependencies', function() {
        runtime.assertTaskDependencies(taskName, ['vcsLogDump']);
      });
    });
  });

  describe('with any supported VCS type', function() {
    assertReport('writes a report on the number of revisions for each valid file', 'revisions-report', 'revisionsReport');
    assertReport('writes a report on the effort distribution for each file', 'effort-report', 'effortReport');
    assertReport('writes a report on the number of authors and revisions for each file', 'authors-report', 'authorsReport');
    assertReport('writes a report on the main developers (by revisions) for each file', 'main-dev-report', 'mainDevReport');
    assertReport('writes a report on the developer ownership (by added lines of code) for each file', 'code-ownership-report', 'codeOwnershipReport');
  });

  describe('with an unsupported VCS type', function() {
    assertMissingReport('revisions-report', 'revisionsReport');
    assertMissingReport('effort-report', 'effortReport');
    assertMissingReport('authors-report', 'authorsReport');
    assertMissingReport('main-dev-report', 'mainDevReport');
    assertMissingReport('code-ownership-report', 'codeOwnershipReport');
  });
});

