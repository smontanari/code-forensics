var Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var gitTasks   = require_src('tasks/vcs_tasks'),
    vcsSupport = require_src('vcs_support');

describe('VCS Tasks', function() {
  var taskFunctions, mockAdapter;

  var sharedExampleStreamFiles = function(description, adapterMethod, taskName, filenamePrefix) {
    describe(taskName, function() {
      it(description, function(done) {
        var tempDir = this.tasksWorkingFolders.tempDir;
        var outStream1 = new stream.PassThrough();
        var outStream2 = new stream.PassThrough();
        mockAdapter[adapterMethod].and.returnValues(outStream1, outStream2);

        taskFunctions[taskName]().then(function() {
          var logContent1 = fs.readFileSync(Path.join(tempDir, filenamePrefix + '_2016-01-01_2016-01-31.log'));
          var logContent2 = fs.readFileSync(Path.join(tempDir, filenamePrefix + '_2016-02-01_2016-02-28.log'));
          expect(logContent1.toString()).toEqual("log-line1\nlog-line2\n");
          expect(logContent2.toString()).toEqual("log-line1\nlog-line2\nlog-line3\n");
          done();
        });

        outStream1.push('log-line1\n');
        outStream1.push('log-line2\n');
        outStream1.end();

        outStream2.push('log-line1\n');
        outStream2.push('log-line2\n');
        outStream2.push('log-line3\n');
        outStream2.end();
      });

      it('does not overwrite a file if already present', function(done) {
        var tempDir = this.tasksWorkingFolders.tempDir;

        fs.writeFileSync(Path.join(tempDir, filenamePrefix + '_2016-01-01_2016-01-31.log'), 'pre-existing content');
        var outStream = new stream.PassThrough();
        mockAdapter[adapterMethod].and.returnValues(outStream);

        taskFunctions[taskName]().then(function() {
          var logContent1 = fs.readFileSync(Path.join(tempDir, filenamePrefix + '_2016-01-01_2016-01-31.log'));
          var logContent2 = fs.readFileSync(Path.join(tempDir, filenamePrefix + '_2016-02-01_2016-02-28.log'));
          expect(logContent1.toString()).toEqual("pre-existing content");
          expect(logContent2.toString()).toEqual("log-line1\nlog-line2\nlog-line3\n");
          done();
        });

        outStream.push('log-line1\n');
        outStream.push('log-line2\n');
        outStream.push('log-line3\n');
        outStream.end();
      });
    });
  };

  beforeEach(function() {
    mockAdapter = jasmine.createSpyObj('vcsAdapter', ['logStream', 'commitMessagesStream']);
    spyOn(vcsSupport, 'adapter').and.returnValue(mockAdapter);

    taskFunctions = this.tasksSetup(gitTasks, null, {
      dateFrom: '2016-01-01', dateTo: '2016-02-28', frequency: 'monthly'
    });
  });

  sharedExampleStreamFiles('writes the vcs log content for each period into the temp folder', 'logStream', 'vcs-log-dump', 'vcslog');

  sharedExampleStreamFiles('writes the vcs commit messages for each period into the temp folder', 'commitMessagesStream', 'vcs-commit-messages', 'vcs_commit_messages');
});
