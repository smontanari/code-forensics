/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "taskOutput.assert*"] }] */
var _        = require('lodash'),
    stream   = require('stream'),
    Bluebird = require('bluebird');

var codeMaatReportTasks = require('tasks/code_maat_reports_tasks'),
    codeMaat            = require('analysers/code_maat'),
    command             = require('command');

var taskHelpers = require('../jest_tasks_helpers');

describe('CodeMaat report tasks', function() {
  var runtime;

  var assertReport = function(exampleDescription, taskName, functionName) {
    describe(taskName, function() {
      var analysisStream;

      beforeEach(function() {
        analysisStream = new stream.PassThrough({ objectMode: true });
        codeMaat.analyser = jest.fn().mockReturnValue(
          {
            fileAnalysisStream: function() { return analysisStream; },
            isSupported: _.stubTrue
          }
        );
      });

      describe('as a Task', function() {
        it(exampleDescription, function() {
          return new Bluebird(function(done) {
            runtime.executePromiseTask(taskName)
              .then(function(taskOutput) {
                return taskOutput.assertTempReport(taskName + '.json');
              })
              .then(function() { done(); })
              .catch(done.fail);

            analysisStream.push({ path: 'test_file1', testData: 123 });
            analysisStream.push({ path: 'test_file2', testData: 456 });
            analysisStream.end();
          });
        });
      });

      describe('as a Function', function() {
        it(exampleDescription, function() {
          return new Bluebird(function(done) {
            runtime.executePromiseFunction(functionName)
              .then(function(taskOutput) {
                return taskOutput.assertTempReport(taskName + '.json');
              })
              .then(function() { done(); })
              .catch(done.fail);

            analysisStream.push({ path: 'test_file1', testData: 123 });
            analysisStream.push({ path: 'test_file2', testData: 456 });
            analysisStream.end();
          });
        });
      });
    });
  };

  var assertMissingReport = function(taskName, functionName) {
    describe(taskName, function() {
      beforeEach(function() {
        codeMaat.analyser = jest.fn().mockReturnValue(
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
    command.Command.ensure = jest.fn();
    runtime = taskHelpers.createRuntime('codemaat_report_tasks', codeMaatReportTasks);
  });

  afterEach(function() {
    return runtime.clear();
  });

  describe('task dependencies', function() {
    it.each([
      'revisions-report',
      'effort-report',
      'authors-report',
      'main-dev-report',
      'code-ownership-report'
    ])('has the required dependencies', function(taskName) {
      runtime.assertTaskDependencies(taskName, ['vcsLogDump']);
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
