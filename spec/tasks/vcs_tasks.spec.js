var _      = require('lodash'),
    Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var gitTasks   = require_src('tasks/vcs_tasks'),
    vcsSupport = require_src('vcs_support'),
    command    = require_src('command');

describe('VCS Tasks', function() {
  var taskFunctions, mockAdapter;
  beforeEach(function() {
    mockAdapter = jasmine.createSpyObj('vcsAdapter', ['logStream', 'commitMessagesStream']);
    spyOn(vcsSupport, 'adapter').and.returnValue(mockAdapter);
    spyOn(command.Command, 'ensure');
  });

  describe('when files already exist', function() {
    beforeEach(function() {
      taskFunctions = this.tasksSetup(gitTasks, null, {
        dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom'
      });
    });

    afterEach(function() {
      this.clearTemp();
    });

    var assertNoOverriding = function(adapterMethod, taskName, filenamePrefix) {
      it('does not overwrite an existing file', function(done) {
        var tempDir = this.tasksWorkingFolders.tempDir;
        fs.writeFileSync(Path.join(tempDir, filenamePrefix + '_2016-01-01_2016-01-31.log'), 'pre-existing content');

        var outStream = new stream.PassThrough();
        mockAdapter[adapterMethod].and.returnValues(outStream);

        taskFunctions[taskName]().then(function() {
          var logContent1 = fs.readFileSync(Path.join(tempDir, filenamePrefix + '_2016-01-01_2016-01-31.log'));
          var logContent2 = fs.readFileSync(Path.join(tempDir, filenamePrefix + '_2016-02-01_2016-02-28.log'));
          expect(logContent1.toString()).toEqual('pre-existing content');
          expect(logContent2.toString()).toEqual("log-line1\nlog-line2\nlog-line3\n");
          done();
        }).catch(function(err) {
          fail(err);
        });

        outStream.push("log-line1\n");
        outStream.push("log-line2\n");
        outStream.push("log-line3\n");
        outStream.end();
      });
    };

    assertNoOverriding('logStream', 'vcs-log-dump', 'vcslog');
    assertNoOverriding('commitMessagesStream', 'vcs-commit-messages', 'vcs_commit_messages');
  });

  describe('when no vcs files exist', function() {
    beforeEach(function() {
      taskFunctions = this.tasksSetup(gitTasks, {
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
      afterEach(function() {
        this.clearRepo();
      });

      it('writes the vcs log content for each period into the temp folder and creates a normalised copy', function(done) {
        var tempDir = this.tasksWorkingFolders.tempDir,
            repoDir = this.tasksWorkingFolders.repoDir;

        _.each(['test_file1', 'test_file2', 'test_file3', 'test_file4', 'test_invalid_file'], function(f) {
          fs.writeFileSync(Path.join(repoDir, f), '');
        });

        var outStream1 = new stream.PassThrough();
        var outStream2 = new stream.PassThrough();
        mockAdapter.logStream.and.returnValues(outStream1, outStream2);

        taskFunctions['vcs-log-dump']().then(function() {
          var logContent1 = fs.readFileSync(Path.join(tempDir, 'vcslog_2016-03-01_2016-03-31.log'));
          var logContent2 = fs.readFileSync(Path.join(tempDir, 'vcslog_2016-04-01_2016-04-30.log'));
          var logContent3 = fs.readFileSync(Path.join(tempDir, 'vcslog_normalised_2016-03-01_2016-03-31.log'));
          var logContent4 = fs.readFileSync(Path.join(tempDir, 'vcslog_normalised_2016-04-01_2016-04-30.log'));
          expect(logContent1.toString()).toEqual([
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
          ].join("\n"));

          expect(logContent2.toString()).toEqual([
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
          expect(logContent3.toString()).toEqual([
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
          expect(logContent4.toString()).toEqual([
            '--98b656f--2016-11-14--Developer 1',
            "31\t12\ttest_file2",
            '',
            '--02790fd--2016-11-17--Developer.3',
            '--5fbfb14--2016-11-24--Dev4',
            "7\t41\ttest_file3",
            "-\t-\ttest_file2",
            "6\t8\ttest_file4\n"
          ].join("\n"));
          done();
        }).catch(function(err) {
          fail(err);
        });

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

        _.each(logLines1, function(line) { outStream1.push(line + "\n"); });
        _.each(logLines2, function(line) { outStream2.push(line + "\n"); });
        outStream1.end();
        outStream2.end();
      });
    });

    describe('vcs-commit-messages', function() {
      it('writes the vcs commit messages for each period into the temp folder', function(done) {
        var tempDir = this.tasksWorkingFolders.tempDir;
        var outStream1 = new stream.PassThrough();
        var outStream2 = new stream.PassThrough();
        mockAdapter.commitMessagesStream.and.returnValues(outStream1, outStream2);

        taskFunctions['vcs-commit-messages']().then(function() {
          var logContent1 = fs.readFileSync(Path.join(tempDir, 'vcs_commit_messages_2016-03-01_2016-03-31.log'));
          var logContent2 = fs.readFileSync(Path.join(tempDir, 'vcs_commit_messages_2016-04-01_2016-04-30.log'));
          expect(logContent1.toString()).toEqual("log-line1\nlog-line2\n");
          expect(logContent2.toString()).toEqual("log-line1\nlog-line2\nlog-line3\n");
          done();
        }).catch(function(err) {
          fail(err);
        });

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
