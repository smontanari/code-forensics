var Path = require('path'),
    fs   = require('fs');

var codeAnalysisTasks = require_src('tasks/code_analysis_tasks');

describe('sloc-report', function() {
  it('writes a report on the number of lines of code for each file in the repository', function(done) {
    var taskFunctions = this.tasksSetup(codeAnalysisTasks);
    var repoDir = this.tasksWorkingFolders.repoDir;
    var tempDir = this.tasksWorkingFolders.tempDir;
    fs.writeFileSync(Path.join(repoDir, 'test_file1.js'), "line1\nline2");
    fs.writeFileSync(Path.join(repoDir, 'test_file2.rb'), "line1\nline2\nline3\n");

    taskFunctions['sloc-report']()
    .on('close', function() {
      var reportContent = fs.readFileSync(Path.join(tempDir, 'sloc-report.json'));
      var report = JSON.parse(reportContent.toString());
      expect(report).toEqual([
        { path: 'test_file1.js', sloc: 2 },
        { path: 'test_file2.rb', sloc: 3 }
      ]);

      done();
    });
  });
});
