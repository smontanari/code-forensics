var stream   = require('stream'),
    Bluebird = require('bluebird');

var vcsTasks = require('tasks/vcs_tasks'),
    vcs      = require('vcs'),
    command  = require('command');

var taskHelpers = require('../jest_tasks_helpers');

describe('VCS Tasks', function() {
  var runtime, mockVcs;
  beforeEach(function() {
    mockVcs = {
      logStream: jest.fn(),
      commitMessagesStream: jest.fn()
    };
    vcs.client = jest.fn().mockReturnValue(mockVcs);
    command.Command.ensure = jest.fn();
  });

  afterEach(function() {
    return runtime.clear();
  });

  describe('when files already exist', function() {
    beforeEach(function() {
      runtime = taskHelpers.createRuntime('vcs_tasks', vcsTasks, null, {
        dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom'
      });
    });

    var assertNoOverriding = function(taskName, functionName, adapterMethod, filenamePrefix) {
      var assertOutput = function(taskOutput) {
        return Bluebird.all([
          taskOutput.assertTempFile(filenamePrefix + '_2016-01-01_2016-01-31.log'),
          taskOutput.assertTempFile(filenamePrefix + '_2016-02-01_2016-02-28.log')
        ]);
      };

      describe(taskName, function() {
        describe('as a Task', function() {
          it('does not overwrite an existing file', function(done) {
            runtime.prepareTempFile(filenamePrefix + '_2016-01-01_2016-01-31.log', 'pre-existing content');
            var outStream = new stream.PassThrough();
            mockVcs[adapterMethod].mockReturnValue(outStream);

            runtime.executePromiseTask(taskName)
              .then(assertOutput)
              .then(function() { done(); })
              .catch(done.fail);

            outStream.push('log-line1\n');
            outStream.push('log-line2\n');
            outStream.push('log-line3\n');
            outStream.end();
          });
        });

        describe('as a Function', function() {
          it('does not overwrite an existing file', function(done) {
            runtime.prepareTempFile(filenamePrefix + '_2016-01-01_2016-01-31.log', 'pre-existing content');
            var outStream = new stream.PassThrough();
            mockVcs[adapterMethod].mockReturnValue(outStream);

            runtime.executePromiseFunction(functionName)
              .then(assertOutput)
              .then(function() { done(); })
              .catch(done.fail);

            outStream.push('log-line1\n');
            outStream.push('log-line2\n');
            outStream.push('log-line3\n');
            outStream.end();
          });
        });
      });
    };

    assertNoOverriding('vcs-log-dump', 'vcsLogDump', 'logStream', 'vcslog');
    assertNoOverriding('vcs-commit-messages', 'vcsCommitMessages', 'commitMessagesStream', 'vcs_commit_messages');
  });

  describe('when no vcs files exist', function() {
    beforeEach(function() {
      runtime = taskHelpers.createRuntime('vcs_tasks', vcsTasks, {
        repository: { excludePaths: ['test_invalid_file'] },
        contributors: {
          'Team 1': ['Developer 1', 'Developer_2'],
          'Team 2': ['Developer.3', ['Dev4', 'Alias developer 4']]
        }
      }, {
        dateFrom: '2016-03-01', dateTo: '2016-04-30', timeSplit: 'eom'
      });
    });

    describe('vcs-log-dump', function() {
      var assertOutput = function(taskOutput) {
        return Bluebird.all([
          taskOutput.assertTempFile('vcslog_2016-03-01_2016-03-31.log'),
          taskOutput.assertTempFile('vcslog_2016-04-01_2016-04-30.log'),
          taskOutput.assertTempFile('vcslog_normalised_2016-03-01_2016-03-31.log'),
          taskOutput.assertTempFile('vcslog_normalised_2016-04-01_2016-04-30.log')
        ]);
      };

      var logLines1 = [
        '--98b656f--2016-10-31--Developer 1',
        '10\t0\ttest_file1',
        '',
        '--6ff89bc--2016-10-31--Developer_2',
        '1\t1\ttest_invalid_file',
        '',
        '--02790fd--2016-10-31--Developer.3',
        '--5fbfb14--2016-10-28--Alias developer 4',
        '0\t1\ttest_file3',
        '-\t-\ttest_invalid_file',
        '6\t8\ttest_file4'
      ];

      var logLines2 = [
        '--98b656f--2016-11-14--Developer 1',
        '31\t12\ttest_file2',
        '1\t1\ttest_invalid_file',
        '',
        '--02790fd--2016-11-17--Developer.3',
        '--5fbfb14--2016-11-24--Alias developer 4',
        '7\t41\ttest_file3',
        '-\t-\ttest_file2',
        '6\t8\ttest_file4'
      ];

      beforeEach(function() {
        ['test_file1', 'test_file2', 'test_file3', 'test_file4', 'test_invalid_file'].forEach(function(f) {
          runtime.prepareRepositoryFile(f, '');
        });
      });

      describe('as a Task', function() {
        it('writes the vcs log content for each period into the temp folder and creates a normalised copy', function(done) {
          var outStream1 = new stream.PassThrough();
          var outStream2 = new stream.PassThrough();
          mockVcs.logStream
            .mockReturnValueOnce(outStream1)
            .mockReturnValueOnce(outStream2);

          runtime.executePromiseTask('vcs-log-dump')
            .then(assertOutput)
            .then(function() { done(); })
            .catch(done.fail);

          logLines1.forEach(function(line) { outStream1.push(line + '\n'); });
          logLines2.forEach(function(line) { outStream2.push(line + '\n'); });
          outStream1.end();
          outStream2.end();
        });
      });

      describe('as a Function', function() {
        it('writes the vcs log content for each period into the temp folder and creates a normalised copy', function(done) {
          var outStream1 = new stream.PassThrough();
          var outStream2 = new stream.PassThrough();
          mockVcs.logStream
            .mockReturnValueOnce(outStream1)
            .mockReturnValueOnce(outStream2);

          runtime.executePromiseFunction('vcsLogDump')
            .then(assertOutput)
            .then(function() { done(); })
            .catch(done.fail);

          logLines1.forEach(function(line) { outStream1.push(line + '\n'); });
          logLines2.forEach(function(line) { outStream2.push(line + '\n'); });
          outStream1.end();
          outStream2.end();
        });
      });
    });

    describe('vcs-commit-messages', function() {
      var assertOutput = function(taskOutput) {
        return Bluebird.all([
          taskOutput.assertTempFile('vcs_commit_messages_2016-03-01_2016-03-31.log'),
          taskOutput.assertTempFile('vcs_commit_messages_2016-04-01_2016-04-30.log')
        ]);
      };

      describe('as a Task', function() {
        it('writes the vcs commit messages for each period into the temp folder', function(done) {
          var outStream1 = new stream.PassThrough();
          var outStream2 = new stream.PassThrough();
          mockVcs.commitMessagesStream
            .mockReturnValueOnce(outStream1)
            .mockReturnValueOnce(outStream2);

          runtime.executePromiseTask('vcs-commit-messages')
            .then(assertOutput)
            .then(function() { done(); })
            .catch(done.fail);

          outStream1.push('log-line1\n');
          outStream1.push('log-line2\n');
          outStream1.end();

          outStream2.push('log-line1\n');
          outStream2.push('log-line2\n');
          outStream2.push('log-line3\n');
          outStream2.end();
        });
      });

      describe('as a Function', function() {
        it('writes the vcs commit messages for each period into the temp folder', function(done) {
          var outStream1 = new stream.PassThrough();
          var outStream2 = new stream.PassThrough();
          mockVcs.commitMessagesStream
            .mockReturnValueOnce(outStream1)
            .mockReturnValueOnce(outStream2);

          runtime.executePromiseFunction('vcsCommitMessages')
            .then(assertOutput)
            .then(function() { done(); })
            .catch(done.fail);

          outStream1.push('log-line1\n');
          outStream1.push('log-line2\n');
          outStream1.end();

          outStream2.push('log-line1\n');
          outStream2.push('log-line2\n');
          outStream2.push('log-line3\n');
          outStream2.end();
        });
      });
    });
  });
});
