var Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var codeMaatReportTasks = require_src('tasks/code_maat_reports_tasks'),
    codeMaat            = require_src('analysers/code_maat');

describe('CodeMaat report tasks', function() {
  var taskFunctions, tempDir;

  var assertTaskReport = function(exampleDescription, analyser, taskName, reportFilename) {
    describe(taskName, function() {
      it(exampleDescription, function(done) {
        var analysisStream = new stream.PassThrough({ objectMode: true });
        spyOn(codeMaat[analyser], 'fileAnalysisStream').and.returnValue(analysisStream);

        taskFunctions[taskName]()
          .on('close', function() {
            var reportContent = fs.readFileSync(Path.join(tempDir, reportFilename));
            var report = JSON.parse(reportContent.toString());
            expect(report).toEqual([
              { path: 'test_file1', testData: 123 },
              { path: 'test_file2', testData: 456 }
            ]);

            done();
          });

        analysisStream.push({ path: 'test_file1', testData: 123 });
        analysisStream.push({ path: 'test_file2', testData: 456 });
        analysisStream.push({ path: 'test_invalid_file', testData: 789 });
        analysisStream.end();
      });
    });
  };

  beforeEach(function() {
    taskFunctions = this.tasksSetup(codeMaatReportTasks, {
      repository: { excludePaths: ['test_invalid_file'] }
    });
    tempDir = this.tasksWorkingFolders.tempDir;

    fs.writeFileSync(Path.join(this.tasksWorkingFolders.repoDir, 'test_file1'), '');
    fs.writeFileSync(Path.join(this.tasksWorkingFolders.repoDir, 'test_file2'), '');
    fs.writeFileSync(Path.join(this.tasksWorkingFolders.repoDir, 'test_invalid_file'), '');
  });

  assertTaskReport('writes a report on the number of revisions for each valid file', 'revisionsAnalyser', 'revisions-report', 'revisions-report.json');
  assertTaskReport('writes a report on the effort distribution for each file', 'effortAnalyser', 'effort-report', 'effort-report.json');
  assertTaskReport('writes a report on the number of authors and revisions for each file', 'authorsAnalyser', 'authors-report', 'authors-report.json');
  assertTaskReport('writes a report on the main developers (by revisions) for each file', 'mainDevAnalyser', 'main-dev-report', 'main-dev-report.json');
});

