var Path = require('path'),
    fs   = require('fs');

var hotspotAnalysisTasks = require_src('tasks/hotspot_analysis_tasks');

describe('Hotspot analysis', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('publishes an analysis report on code size, complexity and revisions for each file in the repository', function(done) {
    var taskFunctions = this.tasksSetup(hotspotAnalysisTasks, { languages: ['ruby'] }, { dateFrom: '2015-03-01' });
    var tempDir = this.tasksWorkingFolders.tempDir;
    var outputDir = this.tasksWorkingFolders.outputDir;

    fs.writeFileSync(Path.join(tempDir, 'sloc-report.json'), JSON.stringify([
      { path: 'test/ruby/app/file1.rb', sloc: 33 },
      { path: 'test/web/styles/file2.css', sloc: 23 },
      { path: 'test/ruby/app/models/file3.rb', sloc: 15 },
      { path: 'test/web/js/file4.js', sloc: 25 }
    ]));

    fs.writeFileSync(Path.join(tempDir, 'revisions-report.json'), JSON.stringify([
      { path: 'test/ruby/app/file1.rb', revisions: 29 },
      { path: 'test/web/styles/file2.css', revisions: 15 },
      { path: 'test/ruby/app/models/file3.rb', revisions: 11 },
      { path: 'test/web/pages/file5.html', revisions: 11 }
    ]));

    fs.writeFileSync(Path.join(tempDir, 'ruby-complexity-report.json'), JSON.stringify([
      { path: 'test/ruby/app/file1.rb', methodComplexity: [{ name: 'File1', complexity: 8.1 }], totalComplexity: 12.9, averageComplexity: 6.4 },
      { path: 'test/ruby/app/models/file3.rb', methodComplexity: [{ name: 'File2', complexity: 14.4 }], totalComplexity: 18.4, averageComplexity: 9.2 },
      { path: 'test/ruby/app/file6.rb', methodComplexity: [{ name: 'File6', complexity: 10.1 }], totalComplexity: 19.3, averageComplexity: 9.6 }
    ]));

    taskFunctions['hotspot-analysis']().then(function() {
      var reportContent = fs.readFileSync(Path.join(outputDir, '103d9a240cc5358f24927d51261fd9dcdb75b314', '2015-03-01_2015-10-22_revisions-hotspot-data.json'));
      var report = JSON.parse(reportContent.toString());
      expect(report).toEqual({
        children: [
          {
            name: 'test',
            children: [
              {
                name: 'ruby',
                children: [
                  {
                    name: 'app',
                    children: [
                      {
                        name: 'file1.rb',
                        children: [],
                        sloc: 33,
                        revisions: 29,
                        totalComplexity: 12.9,
                        weight: 1
                      },
                      {
                        name: 'models',
                        children: [
                          {
                            name: 'file3.rb',
                            children: [],
                            sloc: 15,
                            revisions: 11,
                            totalComplexity: 18.4,
                            weight: 0.3793103448275862
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                name: 'web',
                children: [
                  {
                    name: 'styles',
                    children: [
                      {
                        name: 'file2.css',
                        children: [],
                        sloc: 23,
                        revisions: 15,
                        weight: 0.5172413793103449
                      }
                    ]
                  },
                  {
                    name: 'js',
                    children: [
                      {
                        name: 'file4.js',
                        children: [],
                        sloc: 25,
                        weight: 0
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
      done();
    });
  });
});
