/*global require_src cfHelpers*/
var _      = require('lodash'),
    stream = require('stream');

var gitTasks = require_src('tasks/vcs_tasks'),
    vcs      = require_src('vcs'),
    command  = require_src('command');

describe('VCS Tasks', function() {
  var runtime, mockVcs;
  beforeEach(function() {
    mockVcs = jasmine.createSpyObj('vcsClient', ['logStream', 'commitMessagesStream']);
    spyOn(vcs, 'client').and.returnValue(mockVcs);
    spyOn(command.Command, 'ensure');
  });

  describe('when files already exist', function() {
    beforeEach(function() {
      runtime = cfHelpers.runtimeSetup(gitTasks, null, {
        dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom'
      });
    });

    afterEach(function() {
      cfHelpers.clearTemp();
    });

    var assertNoOverriding = function(taskName, functionName, adapterMethod, filenamePrefix) {
      var assertOutput = function(taskOutput) {
        return taskOutput.assertTempFile(filenamePrefix + '_2016-01-01_2016-01-31.log', 'pre-existing content')
          .then(function() {
            return taskOutput.assertTempFile(filenamePrefix + '_2016-02-01_2016-02-28.log', "log-line1\nlog-line2\nlog-line3\n");
          });
      };

      describe(taskName, function() {
        describe('as a Task', function() {
          it('does not overwrite an existing file', function(done) {
            runtime.prepareTempFile(filenamePrefix + '_2016-01-01_2016-01-31.log', 'pre-existing content');
            var outStream = new stream.PassThrough();
            mockVcs[adapterMethod].and.returnValues(outStream);

            runtime.executePromiseTask(taskName)
              .then(assertOutput)
              .then(done)
              .catch(done.fail);

            outStream.push("log-line1\n");
            outStream.push("log-line2\n");
            outStream.push("log-line3\n");
            outStream.end();
          });
        });

        describe('as a Function', function() {
          it('does not overwrite an existing file', function(done) {
            runtime.prepareTempFile(filenamePrefix + '_2016-01-01_2016-01-31.log', 'pre-existing content');
            var outStream = new stream.PassThrough();
            mockVcs[adapterMethod].and.returnValues(outStream);

            runtime.executePromiseFunction(functionName)
              .then(assertOutput)
              .then(done)
              .catch(done.fail);

            outStream.push("log-line1\n");
            outStream.push("log-line2\n");
            outStream.push("log-line3\n");
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
      runtime = cfHelpers.runtimeSetup(gitTasks, {
        repository: { excludePaths: ['test_invalid_file'] },
        contributors: {
          'Team 1': ['Developer 1', 'Developer_2'],
          'Team 2': ['Developer.3', ['Dev4', 'Alias developer 4']]
        }
      }, {
        dateFrom: '2016-03-01', dateTo: '2016-04-30', timeSplit: 'eom'
      });
    });

    afterEach(function() {
      cfHelpers.clearRepo();
    });

    var assertTempFiles = function(taskOutput) {
      return taskOutput.assertTempFile('vcslog_2016-03-01_2016-03-31.log', [
        '--98b656f--2016-10-31--Developer 1',
        "10\t0\ttest_file1",
        '',
        '--6ff89bc--2016-10-31--Developer_2',
        "1\t1\ttest_invalid_file",
        '',
        '--02790fd--2016-10-31--Developer.3',
        '--5fbfb14--2016-10-28--Alias developer 4',
        "0\t1\ttest_file3",
        "-\t-\ttest_invalid_file",
        "6\t8\ttest_file4\n"
      ].join("\n"))
      .then(function() {
        return taskOutput.assertTempFile('vcslog_2016-04-01_2016-04-30.log', [
          '--98b656f--2016-11-14--Developer 1',
          "31\t12\ttest_file2",
          "1\t1\ttest_invalid_file",
          '',
          '--02790fd--2016-11-17--Developer.3',
          '--5fbfb14--2016-11-24--Alias developer 4',
          "7\t41\ttest_file3",
          "-\t-\ttest_file2",
          "6\t8\ttest_file4\n"
        ].join("\n"));
      })
      .then(function() {
        return taskOutput.assertTempFile('vcslog_normalised_2016-03-01_2016-03-31.log', [
          '--98b656f--2016-10-31--Developer 1',
          "10\t0\ttest_file1",
          '',
          '--6ff89bc--2016-10-31--Developer_2',
          '',
          '--02790fd--2016-10-31--Developer.3',
          '--5fbfb14--2016-10-28--Dev4',
          "0\t1\ttest_file3",
          "6\t8\ttest_file4\n"
        ].join("\n"));
      })
      .then(function() {
        return taskOutput.assertTempFile('vcslog_normalised_2016-04-01_2016-04-30.log', [
          '--98b656f--2016-11-14--Developer 1',
          "31\t12\ttest_file2",
          '',
          '--02790fd--2016-11-17--Developer.3',
          '--5fbfb14--2016-11-24--Dev4',
          "7\t41\ttest_file3",
          "-\t-\ttest_file2",
          "6\t8\ttest_file4\n"
        ].join("\n"));
      });
    };

    var logLines1 = [
      '--98b656f--2016-10-31--Developer 1',
      "10\t0\ttest_file1",
      '',
      '--6ff89bc--2016-10-31--Developer_2',
      "1\t1\ttest_invalid_file",
      '',
      '--02790fd--2016-10-31--Developer.3',
      '--5fbfb14--2016-10-28--Alias developer 4',
      "0\t1\ttest_file3",
      "-\t-\ttest_invalid_file",
      "6\t8\ttest_file4"
    ];

    var logLines2 = [
      '--98b656f--2016-11-14--Developer 1',
      "31\t12\ttest_file2",
      "1\t1\ttest_invalid_file",
      '',
      '--02790fd--2016-11-17--Developer.3',
      '--5fbfb14--2016-11-24--Alias developer 4',
      "7\t41\ttest_file3",
      "-\t-\ttest_file2",
      "6\t8\ttest_file4"
    ];

    describe('vcs-log-dump', function() {
      beforeEach(function() {
        _.each(['test_file1', 'test_file2', 'test_file3', 'test_file4', 'test_invalid_file'], function(f) {
          runtime.prepareRepositoryFile(f, '');
        });
      });

      describe('as a Task', function() {
        it('writes the vcs log content for each period into the temp folder and creates a normalised copy', function(done) {
          var outStream1 = new stream.PassThrough();
          var outStream2 = new stream.PassThrough();
          mockVcs.logStream.and.returnValues(outStream1, outStream2);

          runtime.executePromiseTask('vcs-log-dump')
            .then(assertTempFiles)
            .then(done)
            .catch(done.fail);

          _.each(logLines1, function(line) { outStream1.push(line + "\n"); });
          _.each(logLines2, function(line) { outStream2.push(line + "\n"); });
          outStream1.end();
          outStream2.end();
        });
      });

      describe('as a Function', function() {
        it('writes the vcs log content for each period into the temp folder and creates a normalised copy', function(done) {
          var outStream1 = new stream.PassThrough();
          var outStream2 = new stream.PassThrough();
          mockVcs.logStream.and.returnValues(outStream1, outStream2);

          runtime.executePromiseFunction('vcsLogDump')
            .then(assertTempFiles)
            .then(done)
            .catch(done.fail);

          _.each(logLines1, function(line) { outStream1.push(line + "\n"); });
          _.each(logLines2, function(line) { outStream2.push(line + "\n"); });
          outStream1.end();
          outStream2.end();
        });
      });
    });

    describe('vcs-commit-messages', function() {
      var assertTempFiles = function(taskOutput) {
        return taskOutput.assertTempFile('vcs_commit_messages_2016-03-01_2016-03-31.log', "log-line1\nlog-line2\n")
          .then(function() {
            return taskOutput.assertTempFile('vcs_commit_messages_2016-04-01_2016-04-30.log', "log-line1\nlog-line2\nlog-line3\n");
          });
      };
      describe('as a Task', function() {
        it('writes the vcs commit messages for each period into the temp folder', function(done) {
          var outStream1 = new stream.PassThrough();
          var outStream2 = new stream.PassThrough();
          mockVcs.commitMessagesStream.and.returnValues(outStream1, outStream2);

          runtime.executePromiseTask('vcs-commit-messages')
            .then(assertTempFiles)
            .then(done)
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
          mockVcs.commitMessagesStream.and.returnValues(outStream1, outStream2);

          runtime.executePromiseFunction('vcsCommitMessages')
            .then(assertTempFiles)
            .then(done)
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
