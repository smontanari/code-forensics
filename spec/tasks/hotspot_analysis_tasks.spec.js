/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "taskOutput.assert*", "runtime.assert*"] }] */
var lolex    = require('lolex'),
    Bluebird = require('bluebird');

var taskHelpers = require('../jest_tasks_helpers');

var hotspotAnalysisTasks = require('tasks/hotspot_analysis_tasks');

describe('Hotspot analysis tasks', function() {
  var runtime, clock;

  beforeEach(function() {
    clock = lolex.install({ now: new Date('2015-10-22T10:00:00.000Z') });
  });

  afterEach(function() {
    clock.uninstall();
    return runtime.clear();
  });

  describe('hotspot-analysis', function() {
    it('has the required dependencies', function() {
      runtime = taskHelpers.createRuntime('hotspot_analysis_tasks', hotspotAnalysisTasks);
      runtime.assertTaskDependencies('hotspot-analysis', ['vcsLogDump', 'revisionsReport']);
    });

    describe('for supported languages', function() {
      it('publishes an analysis report on code size, complexity and revisions for each file in the repository', function() {
        runtime = taskHelpers.createRuntime('hotspot_analysis_tasks', hotspotAnalysisTasks, { languages: ['ruby'] }, { dateFrom: '2015-03-01' });

        runtime.prepareTempReport('sloc-report.json', [
          { path: 'test/ruby/app/file1.rb', sourceLines: 33, totalLines: 45 },
          { path: 'test/web/styles/file2.css', sourceLines: 23, totalLines: 31 },
          { path: 'test/ruby/app/models/file3.rb', sourceLines: 15, totalLines: 21 },
          { path: 'test/web/js/file4.js', sourceLines: 25, totalLines: 35 }
        ]);

        runtime.prepareTempReport('revisions-report.json', [
          { path: 'test/ruby/app/file1.rb', revisions: 29 },
          { path: 'test/web/styles/file2.css', revisions: 15 },
          { path: 'test/ruby/app/models/file3.rb', revisions: 11 },
          { path: 'test/web/pages/file5.html', revisions: 11 }
        ]);

        runtime.prepareTempReport('ruby-complexity-report.json', [
          { path: 'test/ruby/app/file1.rb', methodComplexity: [{ name: 'File1', complexity: 8.1 }], totalComplexity: 12.9, averageComplexity: 6.4 },
          { path: 'test/ruby/app/models/file3.rb', methodComplexity: [{ name: 'File2', complexity: 14.4 }], totalComplexity: 18.4, averageComplexity: 9.2 },
          { path: 'test/ruby/app/file6.rb', methodComplexity: [{ name: 'File6', complexity: 10.1 }], totalComplexity: 19.3, averageComplexity: 9.6 }
        ]);

        return runtime.executePromiseTask('hotspot-analysis').then(function(taskOutput) {
          return Bluebird.all([
            taskOutput.assertOutputReport('2015-03-01_2015-10-22_revisions-hotspot-data.json'),
            taskOutput.assertManifest()
          ]);
        });
      });
    });

    describe('with no supported languages', function() {
      it('publishes an analysis report on code size and revisions for each file in the repository', function() {
        runtime = taskHelpers.createRuntime('hotspot_analysis_tasks', hotspotAnalysisTasks, {}, { dateFrom: '2015-03-01' });

        runtime.prepareTempReport('sloc-report.json', [
          { path: 'test/java/app/file1.java', sourceLines: 33, totalLines: 45 },
          { path: 'test/web/styles/file2.css', sourceLines: 23, totalLines: 31 },
          { path: 'test/java/app/models/file3.java', sourceLines: 15, totalLines: 21 },
          { path: 'test/web/jsp/file4.jsp', sourceLines: 25, totalLines: 35 }
        ]);

        runtime.prepareTempReport('revisions-report.json', [
          { path: 'test/java/app/file1.java', revisions: 29 },
          { path: 'test/web/styles/file2.css', revisions: 15 },
          { path: 'test/java/app/models/file3.java', revisions: 11 },
          { path: 'test/web/pages/file5.html', revisions: 11 }
        ]);

        return runtime.executePromiseTask('hotspot-analysis').then(function(taskOutput) {
          return Bluebird.all([
            taskOutput.assertOutputReport('2015-03-01_2015-10-22_revisions-hotspot-data.json'),
            taskOutput.assertManifest()
          ]);
        });
      });
    });
  });
});
