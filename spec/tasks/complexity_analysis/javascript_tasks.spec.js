/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "taskOutput.assert*"] }] */
var stream   = require('stream'),
    lolex    = require('lolex'),
    Bluebird = require('bluebird');

var javascriptTasks = require('tasks/complexity_analysis/javascript_tasks'),
    vcs             = require('vcs');

var taskHelpers = require('../../jest_tasks_helpers');

describe('javascript tasks', function() {
  var runtime;
  afterEach(function() {
    return runtime.clear();
  });

  describe('javascript-complexity-report', function() {
    beforeEach(function() {
      runtime = taskHelpers.createRuntime('javascript_tasks', javascriptTasks);

      runtime.prepareRepositoryFile('test_file1.js', 'function sum(a,b) { return a+b; };');
      runtime.prepareRepositoryFile('test_file2.rb', 'line1\nline2\nline3\n');
      runtime.prepareRepositoryFile('test_file3.js', 'class Calculator { division(a,b) { if (b > 0) { return a/b; } }; };');
    });

    describe('as a Task', function() {
      it('writes a report on the complexity for each javascript file in the repository', function() {
        return runtime.executeStreamTask('javascript-complexity-report').then(function(taskOutput) {
          return taskOutput.assertTempReport('javascript-complexity-report.json');
        });
      });
    });

    describe('as a Function', function() {
      it('writes a report on the complexity for each javascript file in the repository', function() {
        return runtime.executeStreamFunction('javascriptComplexityReport').then(function(taskOutput) {
          return taskOutput.assertTempReport('javascript-complexity-report.json');
        });
      });
    });
  });

  describe('javascript-complexity-trend-analysis', function() {
    var mockVcs, clock;

    beforeEach(function() {
      clock = lolex.install({ now: new Date('2015-10-22T10:00:00.000Z') });
      mockVcs = {
        revisions: jest.fn(),
        showRevisionStream: jest.fn()
      };
      vcs.client = jest.fn().mockReturnValue(mockVcs);
    });

    afterEach(function() {
      clock.uninstall();
    });

    it('publishes an analysis on the complexity trend for a given javascript file in the repository', function() {
      return new Bluebird(function(done) {
        var revisionStream1 = new stream.PassThrough();
        var revisionStream2 = new stream.PassThrough();

        mockVcs.revisions.mockReturnValue([
          { revisionId: 123, date: '2015-04-29T23:00:00.000Z' },
          { revisionId: 456, date: '2015-05-04T23:00:00.000Z' }
        ]);
        mockVcs.showRevisionStream
          .mockReturnValueOnce(revisionStream1)
          .mockReturnValueOnce(revisionStream2);

        runtime = taskHelpers.createRuntime('javascript_tasks', javascriptTasks, null, { dateFrom: '2015-03-01', targetFile: 'test_abs.js' });

        runtime.executePromiseTask('javascript-complexity-trend-analysis').then(function(taskOutput) {
          return Bluebird.all([
            taskOutput.assertOutputReport('2015-03-01_2015-10-22_complexity-trend-data.json'),
            taskOutput.assertManifest()
          ]);
        })
        .then(function() { done(); })
        .catch(done.fail);

        revisionStream1.push('function abs(a,b) {\n');
        revisionStream2.push('function abs(a,b) {\n');
        revisionStream2.push('if (a < b) {\n;');
        revisionStream2.push('return b - a;\n};\n');
        revisionStream1.push('return a - b;\n};');
        revisionStream1.end();
        revisionStream2.push('return a - b;\n');
        revisionStream2.push('};\n');
        revisionStream2.end();
      });
    });
  });
});
