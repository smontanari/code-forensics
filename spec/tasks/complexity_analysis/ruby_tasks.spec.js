/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "taskOutput.assert*"] }] */
var Bluebird = require('bluebird'),
    lolex    = require('lolex'),
    stream   = require('stream');

var rubyTasks = require('tasks/complexity_analysis/ruby_tasks'),
    vcs       = require('vcs'),
    command   = require('command');

var taskHelpers = require('../../jest_tasks_helpers');

describe('ruby tasks', function() {
  var runtime;
  beforeEach(function() {
    command.Command.ensure = jest.fn();
  });

  afterEach(function() {
    return runtime.clear();
  });

  describe('ruby-complexity-report', function() {
    var analysisStream1, analysisStream2;
    beforeEach(function() {
      analysisStream1 = new stream.PassThrough();
      analysisStream2 = new stream.PassThrough();
      command.stream = jest.fn()
        .mockReturnValueOnce(analysisStream1)
        .mockReturnValueOnce(analysisStream2);

      runtime = taskHelpers.createRuntime('ruby_tasks', rubyTasks);
      ['test_file1.rb', 'test_file2.js', 'test_file3.rb'].forEach(function(f) {
        runtime.prepareRepositoryFile(f, '');
      });
    });

    var streamData = function() {
      [
        '\t22.0: flog total\n',
        '\t 7.3: flog/method average\n'
      ].forEach(function(line) {
        analysisStream1.push(line);
      });
      [
        '\t95.1: flog total\n',
        '\t 8.6: flog/method average\n',
        '\n',
        '\t26.2: Module::TestFile2#test_method /absolute/path/test_file3.rb:54'
      ].forEach(function(line) { analysisStream2.push(line); });
      [
        '\n',
        '\t18.6: main#none\n',
        '\t 1.7: chain#linking_to          /absolute/path/test_file1.rb:8\n'
      ].forEach(function(line) { analysisStream1.push(line); });

      analysisStream2.end();
      analysisStream1.end();
    };

    describe('as a Task', function() {
      it('writes a report on the complexity for each ruby file in the repository', function() {
        return new Bluebird(function(done) {
          runtime.executeStreamTask('ruby-complexity-report')
            .then(function(taskOutput) {
              return taskOutput.assertTempReport('ruby-complexity-report.json');
            })
            .then(function() { done(); })
            .catch(done.fail);

          streamData();
        });
      });
    });

    describe('as a Function', function() {
      it('writes a report on the complexity for each ruby file in the repository', function() {
        return new Bluebird(function(done) {
          runtime.executeStreamFunction('rubyComplexityReport')
            .then(function(taskOutput) {
              return taskOutput.assertTempReport('ruby-complexity-report.json');
            })
            .then(function() { done(); })
            .catch(done.fail);

          streamData();
        });
      });
    });
  });

  describe('ruby-complexity-trend-analysis', function() {
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

    it('publishes an analysis on the complexity trend for a given ruby file in the repository', function() {
      return new Bluebird(function(done) {
        var revisionStream1 = new stream.PassThrough();
        var revisionStream2 = new stream.PassThrough();
        var complexityStream1 = new stream.PassThrough();
        var complexityStream2 = new stream.PassThrough();

        mockVcs.revisions.mockReturnValue([
          { revisionId: 123, date: '2015-04-29T23:00:00.000Z' },
          { revisionId: 456, date: '2015-05-04T23:00:00.000Z' }
        ]);
        mockVcs.showRevisionStream
          .mockReturnValueOnce(revisionStream1)
          .mockReturnValueOnce(revisionStream2);
        command.createAsync = jest.fn()
          .mockReturnValueOnce({ stdin: new stream.PassThrough(), stdout: complexityStream1 })
          .mockReturnValueOnce({ stdin: new stream.PassThrough(), stdout: complexityStream2 });

        runtime = taskHelpers.createRuntime('ruby_tasks', rubyTasks, null, { dateFrom: '2015-03-01', targetFile: 'test_abs.rb' });
        runtime.executePromiseTask('ruby-complexity-trend-analysis').then(function(taskOutput) {
          return Bluebird.all([
            taskOutput.assertOutputReport('2015-03-01_2015-10-22_complexity-trend-data.json'),
            taskOutput.assertManifest()
          ]);
        })
        .then(function() { done(); })
        .catch(done.fail);

        revisionStream1.push('def abs(a,b)\n');
        revisionStream1.push('a - b\nend');
        revisionStream1.end();

        revisionStream2.push('def abs(a,b)\n');
        revisionStream2.push('return b - a if (a < b)\n');
        revisionStream2.push('a - b\n');
        revisionStream2.push('end\n');
        revisionStream2.end();

        complexityStream1.push(
          '\t22.0: flog total\n' +
          '\t 7.3: flog/method average\n' +
          '\n' +
          '\t18.6: main#none\n' +
          '\t 1.7: chain#linking_to          /absolute/path/test_abs.rb:8\n'
        );
        complexityStream1.end();

        complexityStream2.push(
          '\t95.1: flog total\n' +
          '\t 8.6: flog/method average\n' +
          '\n' +
          '\t26.2: Module::TestFile2#test_method /absolute/path/test_abs.rb:54'
        );
        complexityStream2.end();
      });
    });
  });
});
