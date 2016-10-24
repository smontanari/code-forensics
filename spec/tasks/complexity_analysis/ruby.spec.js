var Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var rubyTasks = require_src('tasks/complexity_analysis/ruby'),
    vcsSupport = require_src('vcs_support');

describe('ruby tasks', function() {
  var taskFunctions, repoDir, tempDir, outputDir;
  beforeEach(function() {
    repoDir = this.tasksWorkingFolders.repoDir;
    tempDir = this.tasksWorkingFolders.tempDir;
    outputDir = this.tasksWorkingFolders.outputDir;
  });

  describe('ruby-complexity-analysis', function() {
    beforeEach(function() {
      taskFunctions = this.tasksSetup(rubyTasks);
    });

    it('writes a report on the complexity for each ruby file in the repository', function(done) {
      fs.writeFileSync(Path.join(repoDir, 'test_file1.rb'), "def sum(a,b); a+b; end");
      fs.writeFileSync(Path.join(repoDir, 'test_file2.js'), "line1\nline2\nline3\n");
      fs.writeFileSync(Path.join(repoDir, 'test_file3.rb'), "class Calculator; def division(a,b); return a/b if b > 0; end; end");

      taskFunctions['ruby-complexity-analysis']()
      .on('close', function() {
        var reportContent = fs.readFileSync(Path.join(tempDir, 'ruby-complexity-analysis.json'));
        var report = JSON.parse(reportContent.toString());
        expect(report.length).toEqual(2);
        expect(report).toContain({ path: "test_file1.rb", totalComplexity: 1, averageComplexity: 1, methodComplexity: [{ name: 'main#sum                         ' + repoDir + '/test_file1.rb:1', complexity: 1 }] });
        expect(report).toContain({ path: "test_file3.rb", totalComplexity: 2.3, averageComplexity: 2.3, methodComplexity: [{ name: 'Calculator#division              ' + repoDir + '/test_file3.rb:1', complexity: 2.3 }] });

        done();
      });
    });
  });

  describe('ruby-complexity-trend-analysis', function() {
    var mockAdapter;

    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
      mockAdapter = jasmine.createSpyObj('vcsAdapter', ['revisions', 'showRevisionStream']);

      spyOn(vcsSupport, 'adapter').and.returnValue(mockAdapter);

      taskFunctions = this.tasksSetup(rubyTasks, null, { dateFrom: '2015-03-01', targetFile: 'test_abs.rb' });
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('writes a report on the complexity trend for a given ruby file in the repository', function(done) {
      var revisionStream1 = new stream.PassThrough();
      var revisionStream2 = new stream.PassThrough();

      mockAdapter.revisions.and.returnValue([
        { revisionId: 123, date: '2015-04-29T23:00:00.000Z' },
        { revisionId: 456, date: '2015-05-04T23:00:00.000Z' }
      ]);
      mockAdapter.showRevisionStream.and.returnValues(revisionStream1, revisionStream2);

      taskFunctions['ruby-complexity-trend-analysis']().then(function() {
        var reportContent = fs.readFileSync(Path.join(outputDir, '1e3bebd4760a96a316b64690b7d9d96a4cfa3558', '2015-03-01_2015-10-22_complexity-trend-data.json'));
        var report = JSON.parse(reportContent.toString());
        expect(report.length).toEqual(2);
        expect(report).toContain({ revision: 123, date: '2015-04-29T23:00:00.000Z', path: 'test_abs.rb', totalComplexity: 1, averageComplexity: 1, methodComplexity: [{ name: 'main#abs                         -:1', complexity: 1 }] });
        expect(report).toContain({ revision: 456, date: '2015-05-04T23:00:00.000Z', path: 'test_abs.rb', totalComplexity: 3.3, averageComplexity: 3.3, methodComplexity: [{ name: 'main#abs                         -:1', complexity: 3.3 }] });

        done();
      });

      revisionStream1.write("def abs(a,b)\n");
      revisionStream1.write("a - b\nend");
      revisionStream1.end();

      revisionStream2.write("def abs(a,b)\n");
      revisionStream2.write("return b - a if (a < b)\n");
      revisionStream2.write("a - b\n");
      revisionStream2.write("end\n");
      revisionStream2.end();
    });
  });
});
