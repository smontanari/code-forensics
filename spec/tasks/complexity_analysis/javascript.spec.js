var Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var javascriptTasks = require_src('tasks/complexity_analysis/javascript'),
    vcsSupport      = require_src('vcs_support');

describe('javascript tasks', function() {
  var taskFunctions, repoDir, tempDir, outputDir;
  beforeEach(function() {
    repoDir = this.tasksWorkingFolders.repoDir;
    tempDir = this.tasksWorkingFolders.tempDir;
    outputDir = this.tasksWorkingFolders.outputDir;
  });

  describe('javascript-complexity-report', function() {
    beforeEach(function() {
      taskFunctions = this.tasksSetup(javascriptTasks);
    });

    it('writes a report on the complexity for each javascript file in the repository', function(done) {
      fs.writeFileSync(Path.join(repoDir, 'test_file1.js'), "function sum(a,b) { return a+b; };");
      fs.writeFileSync(Path.join(repoDir, 'test_file2.rb'), "line1\nline2\nline3\n");
      fs.writeFileSync(Path.join(repoDir, 'test_file3.js'), "function Calculator() { this.division = function(a,b) { if (b > 0) { return a/b; } }; };");

      taskFunctions['javascript-complexity-report']()
      .on('close', function() {
        var reportContent = fs.readFileSync(Path.join(tempDir, 'javascript-complexity-report.json'));
        var report = JSON.parse(reportContent.toString());
        expect(report).toEqual([
          { path: "test_file1.js", totalComplexity: 1, averageComplexity: 1, methodComplexity: [{ name: 'sum', complexity: 1 }] },
          { path: "test_file3.js", totalComplexity: 2, averageComplexity: 1.5, methodComplexity: [{ name: 'Calculator', complexity: 1 }, { name: '<anonymous>.division', complexity: 2 }] }
        ]);

        done();
      }).on('error', function(err) {
        fail(err);
      });
    });
  });

  describe('javascript-complexity-trend-analysis', function() {
    var mockAdapter;

    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
      mockAdapter = jasmine.createSpyObj('vcsAdapter', ['revisions', 'showRevisionStream']);

      spyOn(vcsSupport, 'adapter').and.returnValue(mockAdapter);

      taskFunctions = this.tasksSetup(javascriptTasks, null, { dateFrom: '2015-03-01', targetFile: 'test_abs.js' });
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('publishes an analysis on the complexity trend for a given javascript file in the repository', function(done) {
      var revisionStream1 = new stream.PassThrough();
      var revisionStream2 = new stream.PassThrough();

      mockAdapter.revisions.and.returnValue([
        { revisionId: 123, date: '2015-04-29T23:00:00.000Z' },
        { revisionId: 456, date: '2015-05-04T23:00:00.000Z' }
      ]);
      mockAdapter.showRevisionStream.and.returnValues(revisionStream1, revisionStream2);

      taskFunctions['javascript-complexity-trend-analysis']().then(function() {
        var reportContent = fs.readFileSync(Path.join(outputDir, '41ab3dc9b2f3c211c9e26ce4bef11eb8104fc930', '2015-03-01_2015-10-22_complexity-trend-data.json'));
        var report = JSON.parse(reportContent.toString());
        expect(report).toEqual([
          { revision: 123, date: '2015-04-29T23:00:00.000Z', path: 'test_abs.js', totalComplexity: 1, averageComplexity: 1, methodComplexity: [{ name: 'abs', complexity: 1 }] },
          { revision: 456, date: '2015-05-04T23:00:00.000Z', path: 'test_abs.js', totalComplexity: 2, averageComplexity: 2, methodComplexity: [{ name: 'abs', complexity: 2 }] }
        ]);

        done();
      }).fail(function(err) {
        fail(err);
      });

      revisionStream1.push("var abs = function(a,b) {\n");
      revisionStream1.push("return a - b;\n};");
      revisionStream1.end();

      revisionStream2.push("var abs = function(a,b) {\n");
      revisionStream2.push("if (a < b) {\n;");
      revisionStream2.push("return b - a;\n};\n");
      revisionStream2.push("return a - b;\n");
      revisionStream2.push("};\n");
      revisionStream2.end();
    });
  });
});
