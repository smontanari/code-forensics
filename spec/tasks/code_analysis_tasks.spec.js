var Path   = require('path'),
    _      = require('lodash'),
    fs     = require('fs'),
    stream = require('stream');

var codeAnalysisTasks = require_src('tasks/code_analysis_tasks'),
    vcsSupport        = require_src('vcs_support');

describe('Code analysis tasks', function() {
  describe('sloc-report', function() {
    afterEach(function() {
      this.clearTemp();
      this.clearRepo();
    });

    it('writes a report on the number of lines of code for each file in the repository', function(done) {
      var repoDir = this.tasksWorkingFolders.repoDir;
      var tempDir = this.tasksWorkingFolders.tempDir;
      fs.writeFileSync(Path.join(repoDir, 'test_file1.js'), "line1\nline2");
      fs.writeFileSync(Path.join(repoDir, 'test_file2.rb'), "line1\nline2\nline3\n");

      var taskFunctions = this.tasksSetup(codeAnalysisTasks);
      taskFunctions['sloc-report']()
      .on('close', function() {
        var reportContent = fs.readFileSync(Path.join(tempDir, 'sloc-report.json'));
        var report = JSON.parse(reportContent.toString());
        expect(report).toEqual([
          { path: 'test_file1.js', sourceLines: 2, totalLines: 2 },
          { path: 'test_file2.rb', sourceLines: 3, totalLines: 3 }
        ]);

        done();
      }).on('error', function(err) {
        fail(err);
      });
    });
  });

  describe('sloc-trend-analysis', function() {
    var mockAdapter;

    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
      mockAdapter = jasmine.createSpyObj('vcsAdapter', ['revisions', 'showRevisionStream']);

      spyOn(vcsSupport, 'adapter').and.returnValue(mockAdapter);
    });

    afterEach(function() {
      jasmine.clock().uninstall();
      this.clearOutput();
    });

    it('publishes an analysis on the sloc trend for a given file in the repository', function(done) {
      var revisionStream1 = new stream.PassThrough();
      var revisionStream2 = new stream.PassThrough();
      var outputDir = this.tasksWorkingFolders.outputDir;

      mockAdapter.revisions.and.returnValue([
        { revisionId: 123, date: '2015-04-29T23:00:00.000Z' },
        { revisionId: 456, date: '2015-05-04T23:00:00.000Z' }
      ]);
      mockAdapter.showRevisionStream.and.returnValues(revisionStream1, revisionStream2);

      var taskFunctions = this.tasksSetup(codeAnalysisTasks, null, { dateFrom: '2015-03-01', targetFile: 'test_abs.rb' });
      taskFunctions['sloc-trend-analysis']().then(function() {
        var reportContent = fs.readFileSync(Path.join(outputDir, 'dbe9f7623278c6f5b3acbd89c20b4b5d70661491', '2015-03-01_2015-10-22_sloc-trend-data.json'));
        var report = JSON.parse(reportContent.toString());
        expect(report).toEqual([
          { revision: 123, date: '2015-04-29T23:00:00.000Z', path: 'test_abs.rb', sourceLines: 3, totalLines: 3 },
          { revision: 456, date: '2015-05-04T23:00:00.000Z', path: 'test_abs.rb', sourceLines: 5, totalLines: 5 }
        ]);

        done();
      }).catch(function(err) {
        fail(err);
      });

      _.times(3, function(n) {
        revisionStream1.push('line ' + n + "\n");
      });
      revisionStream1.end();

      _.times(5, function(n) {
        revisionStream2.push('line ' + n + "\n");
      });
      revisionStream2.end();
    });
  });
});
