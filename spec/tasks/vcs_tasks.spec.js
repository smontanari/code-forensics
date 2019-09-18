var stream   = require('stream'),
    Bluebird = require('bluebird');

var vcsTasks       = require('tasks/vcs_tasks'),
    vcs            = require('vcs'),
    command        = require('command'),
    CFRuntimeError = require('models/errors').CFRuntimeError;

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

  var setupRuntime = function(excludePathsExpr) {
    runtime = taskHelpers.createRuntime('vcs_tasks', vcsTasks, {
      repository: { excludePaths: [excludePathsExpr || ''] },
      contributors: {
        'Team 1': ['Developer 1', 'Developer_2'],
        'Team 2': ['Developer.3', ['Dev4', 'Alias developer 4']]
      }
    }, {
      dateFrom: '2016-02-01', dateTo: '2016-04-30', timeSplit: 'eom'
    });

    ['vcslog', 'vcslog_normalised', 'vcs_commit_messages'].forEach(function(filenamePrefix) {
      runtime.prepareTempFile(filenamePrefix + '_2016-02-01_2016-02-29.log', 'pre-existing content');
    });
    ['test_file1', 'test_file2', 'test_file3', 'test_file4', 'test_invalid_file'].forEach(function(f) {
      runtime.prepareRepositoryFile(f, '');
    });
  };

  describe.each([
    ['Task', 'vcs-log-dump'],
    ['Function', 'vcsLogDump']
  ])('vcs log generation', function(executionType, executionName) {
    var assertOutput = function(taskOutput) {
      return Bluebird.all([
        taskOutput.assertTempFile('vcslog_2016-02-01_2016-02-29.log'),
        taskOutput.assertTempFile('vcslog_2016-03-01_2016-03-31.log'),
        taskOutput.assertTempFile('vcslog_2016-04-01_2016-04-30.log'),
        taskOutput.assertTempFile('vcslog_normalised_2016-02-01_2016-02-29.log'),
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

    var verifyTaskAndFunctionOutput = function(executionError) {
      describe('as a ' + executionType, function() {
        it('writes the vcs log content for each period into the temp folder and creates a normalised copy', function(done) {
          var outStream1 = new stream.PassThrough();
          var outStream2 = new stream.PassThrough();
          mockVcs.logStream
            .mockReturnValueOnce(outStream1)
            .mockReturnValueOnce(outStream2);

            var resultPromise = runtime['executePromise' + executionType](executionName).then(assertOutput);
            if (executionError) {
              resultPromise
                .then(function() { done.fail('Expected error: ' + executionError); })
                .catch(function(err) {
                  expect(err.taskException).toBeInstanceOf(CFRuntimeError);
                  expect(err.taskException.message).toEqual(executionError);
                  return assertOutput(err.taskOutput);
                })
                .finally(done);
            } else {
              resultPromise.then(function() { done(); }).catch(done.fail);
            }

          logLines1.forEach(function(line) { outStream1.push(line + '\n'); });
          logLines2.forEach(function(line) { outStream2.push(line + '\n'); });
          outStream1.end();
          outStream2.end();
        });
      });
    };

    describe('when relevant file metrics are captured', function() {
      beforeEach(function() {
        setupRuntime('test_invalid_file');
      });

      verifyTaskAndFunctionOutput();
    });

    describe('when no relevant file metrics are captured', function() {
      beforeEach(function() {
        setupRuntime('test_*');
      });

      verifyTaskAndFunctionOutput('No commit data available');
    });
  });

  describe.each([
    ['Task', 'vcs-commit-messages'],
    ['Function', 'vcsCommitMessages']
  ])('vcs commit messages generation', function(executionType, executionName) {
    var assertOutput = function(taskOutput) {
      return Bluebird.all([
        taskOutput.assertTempFile('vcs_commit_messages_2016-02-01_2016-02-29.log'),
        taskOutput.assertTempFile('vcs_commit_messages_2016-03-01_2016-03-31.log'),
        taskOutput.assertTempFile('vcs_commit_messages_2016-04-01_2016-04-30.log')
      ]);
    };

    beforeEach(function() {
      setupRuntime();
    });

    describe('as a ' + executionType, function() {
      it('writes the vcs commit messages for each period into the temp folder', function(done) {
        var outStream1 = new stream.PassThrough();
        var outStream2 = new stream.PassThrough();
        mockVcs.commitMessagesStream
          .mockReturnValueOnce(outStream1)
          .mockReturnValueOnce(outStream2);

        runtime['executePromise' + executionType](executionName)
          .then(assertOutput)
          .then(function() { done(); })
          .catch(done.fail);

        outStream1.push('messages-1-line1\n');
        outStream1.push('messages-1-line2\n');
        outStream1.end();

        outStream2.push('messages-2-line1\n');
        outStream2.push('messages-2-line2\n');
        outStream2.push('messages-2-line3\n');
        outStream2.end();
      });
    });
  });
});
