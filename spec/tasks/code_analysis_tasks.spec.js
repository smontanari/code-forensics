/*global require_src*/
var _      = require('lodash'),
    stream = require('stream');

var codeAnalysisTasks = require_src('tasks/code_analysis_tasks'),
    vcs               = require_src('vcs');

describe('Code analysis tasks', function() {
  describe('sloc-report', function() {
    afterEach(function() {
      this.clearTemp();
      this.clearRepo();
    });

    it('writes a report on the number of lines of code for each file in the repository', function(done) {
      var runtime = this.runtimeSetup(codeAnalysisTasks);

      runtime.prepareRepositoryFile('test_file1.js', "line1\nline2");
      runtime.prepareRepositoryFile('test_file2.rb', "line1\nline2\nline3\n");

      runtime.executeStreamTask('sloc-report').then(function(taskOutput) {
        taskOutput.assertTempReport('sloc-report.json', [
          { path: 'test_file1.js', sourceLines: 2, totalLines: 2 },
          { path: 'test_file2.rb', sourceLines: 3, totalLines: 3 }
        ]);
        done();
      });
    });
  });

  describe('sloc-trend-analysis', function() {
    var mockVcsClient;

    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
      mockVcsClient = jasmine.createSpyObj('vcsAdapter', ['revisions', 'showRevisionStream']);

      spyOn(vcs, 'client').and.returnValue(mockVcsClient);
    });

    afterEach(function() {
      jasmine.clock().uninstall();
      this.clearOutput();
    });

    it('publishes an analysis on the sloc trend for a given file in the repository', function(done) {
      var revisionStream1 = new stream.PassThrough();
      var revisionStream2 = new stream.PassThrough();

      mockVcsClient.revisions.and.returnValue([
        { revisionId: 123, date: '2015-04-29T23:00:00.000Z' },
        { revisionId: 456, date: '2015-05-04T23:00:00.000Z' }
      ]);
      mockVcsClient.showRevisionStream.and.returnValues(revisionStream1, revisionStream2);

      var runtime = this.runtimeSetup(codeAnalysisTasks, null, { dateFrom: '2015-03-01', targetFile: 'test_abs.rb' });
      runtime.executePromiseTask('sloc-trend-analysis').then(function(taskOutput) {
        taskOutput.assertOutputReport('2015-03-01_2015-10-22_sloc-trend-data.json', [
          { revision: 123, date: '2015-04-29T23:00:00.000Z', path: 'test_abs.rb', sourceLines: 3, totalLines: 3 },
          { revision: 456, date: '2015-05-04T23:00:00.000Z', path: 'test_abs.rb', sourceLines: 5, totalLines: 5 }
        ]);
        taskOutput.assertManifest({
          reportName: 'sloc-trend',
          parameters: { targetFile: 'test_abs.rb' },
          dateRange: '2015-03-01_2015-10-22',
          enabledDiagrams: ['sloc']
        });
        done();
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
