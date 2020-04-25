/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "taskOutput.assert*"] }] */
var _        = require('lodash'),
    Bluebird = require('bluebird'),
    stream   = require('stream'),
    lolex    = require('lolex');

var codeAnalysisTasks = require('tasks/code_analysis_tasks'),
    vcs               = require('vcs');

var taskHelpers = require('../jest_tasks_helpers');

describe('Code analysis tasks', function() {
  var runtime;

  afterEach(function() {
    return runtime.clear();
  });

  describe('sloc-report', function() {
    beforeEach(function() {
      runtime = taskHelpers.createRuntime('code_analysis_tasks', codeAnalysisTasks);

      runtime.prepareRepositoryFile('test_file1.js', 'line1\nline2');
      runtime.prepareRepositoryFile('test_file2.rb', 'line1\nline2\nline3\n');
    });

    describe('as a Task', function() {
      it('writes a report on the number of lines of code for each file in the repository', function() {
        return runtime.executeStreamTask('sloc-report').then(function(taskOutput) {
          return taskOutput.assertTempReport('sloc-report.json');
        });
      });
    });

    describe('as a Function', function() {
      it('writes a report on the number of lines of code for each file in the repository', function() {
        return runtime.executeStreamFunction('slocReport').then(function(taskOutput) {
          return taskOutput.assertTempReport('sloc-report.json');
        });
      });
    });
  });

  describe('sloc-trend-analysis', function() {
    var mockVcsClient, clock;

    beforeEach(function() {
      clock = lolex.install({ now: new Date('2015-10-22T10:00:00.000Z') });
      mockVcsClient = {
        revisions: jest.fn(),
        showRevisionStream: jest.fn()
      };

      vcs.client = jest.fn().mockReturnValue(mockVcsClient);
    });

    afterEach(function() {
      clock.uninstall();
    });

    it('publishes an analysis on the sloc trend for a given file in the repository', function() {
      return new Bluebird(function(done) {
        var revisionStream1 = new stream.PassThrough();
        var revisionStream2 = new stream.PassThrough();

        mockVcsClient.revisions.mockReturnValue([
          { revisionId: 123, date: '2015-04-29T23:00:00.000Z' },
          { revisionId: 456, date: '2015-05-04T23:00:00.000Z' }
        ]);
        mockVcsClient.showRevisionStream
          .mockReturnValueOnce(revisionStream1)
          .mockReturnValueOnce(revisionStream2);

        runtime = taskHelpers.createRuntime('code_analysis_tasks', codeAnalysisTasks, null, { dateFrom: '2015-03-01', targetFile: 'test_abs.rb' });
        runtime.executePromiseTask('sloc-trend-analysis')
          .then(function(taskOutput) {
            return Bluebird.all([
              taskOutput.assertOutputReport('2015-03-01_2015-10-22_sloc-trend-data.json'),
              taskOutput.assertManifest()
            ]);
          })
          .then(function() { done(); })
          .catch(done.fail);

        _.times(3, function(n) {
          revisionStream1.push('line ' + n + '\n');
        });
        revisionStream1.end();

        _.times(5, function(n) {
          revisionStream2.push('line ' + n + '\n');
        });
        revisionStream2.end();
      });
    });
  });
});
