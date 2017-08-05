var Path = require('path'),
    fs   = require('fs');

var hotspotAnalysisTasks = require_src('tasks/hotspot_analysis_tasks');

describe('Hotspot analysis tasks', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  describe('hotspot-analysis', function() {
    afterEach(function() {
      this.clearTemp();
      this.clearOutput();
    });

    it('publishes an analysis report on code size, complexity and revisions for each file in the repository', function(done) {
      var outputDir = this.tasksWorkingFolders.outputDir;

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'sloc-report.json'), JSON.stringify([
        { path: 'test/ruby/app/file1.rb', sourceLines: 33, totalLines: 45 },
        { path: 'test/web/styles/file2.css', sourceLines: 23, totalLines: 31 },
        { path: 'test/ruby/app/models/file3.rb', sourceLines: 15, totalLines: 21 },
        { path: 'test/web/js/file4.js', sourceLines: 25, totalLines: 35 }
      ]));

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'revisions-report.json'), JSON.stringify([
        { path: 'test/ruby/app/file1.rb', revisions: 29 },
        { path: 'test/web/styles/file2.css', revisions: 15 },
        { path: 'test/ruby/app/models/file3.rb', revisions: 11 },
        { path: 'test/web/pages/file5.html', revisions: 11 }
      ]));

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'ruby-complexity-report.json'), JSON.stringify([
        { path: 'test/ruby/app/file1.rb', methodComplexity: [{ name: 'File1', complexity: 8.1 }], totalComplexity: 12.9, averageComplexity: 6.4 },
        { path: 'test/ruby/app/models/file3.rb', methodComplexity: [{ name: 'File2', complexity: 14.4 }], totalComplexity: 18.4, averageComplexity: 9.2 },
        { path: 'test/ruby/app/file6.rb', methodComplexity: [{ name: 'File6', complexity: 10.1 }], totalComplexity: 19.3, averageComplexity: 9.6 }
      ]));

      var taskFunctions = this.tasksSetup(hotspotAnalysisTasks, { languages: ['ruby'] }, { dateFrom: '2015-03-01' });
      taskFunctions['hotspot-analysis']().then(function() {
        var report = JSON.parse(fs.readFileSync(Path.join(outputDir, '103d9a240cc5358f24927d51261fd9dcdb75b314', '2015-03-01_2015-10-22_revisions-hotspot-data.json')));
        var manifest = JSON.parse(fs.readFileSync(Path.join(outputDir, '103d9a240cc5358f24927d51261fd9dcdb75b314', 'manifest.json')));
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
                          sourceLines: 33,
                          totalLines: 45,
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
                              sourceLines: 15,
                              totalLines: 21,
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
                          sourceLines: 23,
                          totalLines: 31,
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
                          sourceLines: 25,
                          totalLines: 35,
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
        expect(manifest.enabledDiagrams).toEqual(['sloc', 'complexity']);
        done();
      }).catch(function(err) {
        fail(err);
      });
    });

    it('publishes an analysis report on code size and revisions for each file in the repository', function(done) {
      var outputDir = this.tasksWorkingFolders.outputDir;

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'sloc-report.json'), JSON.stringify([
        { path: 'test/java/app/file1.java', sourceLines: 33, totalLines: 45 },
        { path: 'test/web/styles/file2.css', sourceLines: 23, totalLines: 31 },
        { path: 'test/java/app/models/file3.java', sourceLines: 15, totalLines: 21 },
        { path: 'test/web/jsp/file4.jsp', sourceLines: 25, totalLines: 35 }
      ]));

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'revisions-report.json'), JSON.stringify([
        { path: 'test/java/app/file1.java', revisions: 29 },
        { path: 'test/web/styles/file2.css', revisions: 15 },
        { path: 'test/java/app/models/file3.java', revisions: 11 },
        { path: 'test/web/pages/file5.html', revisions: 11 }
      ]));

      var taskFunctions = this.tasksSetup(hotspotAnalysisTasks, { /*languages: ['java']*/ }, { dateFrom: '2015-03-01' });
      taskFunctions['hotspot-analysis']().then(function() {
        var report = JSON.parse(fs.readFileSync(Path.join(outputDir, '103d9a240cc5358f24927d51261fd9dcdb75b314', '2015-03-01_2015-10-22_revisions-hotspot-data.json')));
        var manifest = JSON.parse(fs.readFileSync(Path.join(outputDir, '103d9a240cc5358f24927d51261fd9dcdb75b314', 'manifest.json')));
        expect(report).toEqual({
          children: [
            {
              name: 'test',
              children: [
                {
                  name: 'java',
                  children: [
                    {
                      name: 'app',
                      children: [
                        {
                          name: 'file1.java',
                          children: [],
                          sourceLines: 33,
                          totalLines: 45,
                          revisions: 29,
                          weight: 1
                        },
                        {
                          name: 'models',
                          children: [
                            {
                              name: 'file3.java',
                              children: [],
                              sourceLines: 15,
                              totalLines: 21,
                              revisions: 11,
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
                          sourceLines: 23,
                          totalLines: 31,
                          revisions: 15,
                          weight: 0.5172413793103449
                        }
                      ]
                    },
                    {
                      name: 'jsp',
                      children: [
                        {
                          name: 'file4.jsp',
                          children: [],
                          sourceLines: 25,
                          totalLines: 35,
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
        expect(manifest.enabledDiagrams).toEqual(['sloc']);
        done();
      }).catch(function(err) {
        fail(err);
      });
    });
  });
});
