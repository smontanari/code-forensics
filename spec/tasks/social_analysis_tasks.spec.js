/*eslint-disable max-lines*/
var _      = require('lodash'),
    Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var socialAnalysisTasks = require_src('tasks/social_analysis_tasks'),
    codeMaat            = require_src('analysers/code_maat');

describe('Social analysis tasks', function() {
  var taskFunctions, outputDir, repoDir;

  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2016-10-22T10:00:00.000Z'));
    outputDir = this.tasksWorkingFolders.outputDir;
    repoDir = this.tasksWorkingFolders.repoDir;
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  var assertTaskReport = function(file, content) {
    var reportContent = fs.readFileSync(file);
    var report = JSON.parse(reportContent.toString());
    expect(report).toEqual(content);
  };

  describe('commit-message-analysis', function() {
    beforeEach(function() {
      var messages1 = [
        'First-only message abc 123',
        'Second message xxx-word 456',
        'xxx-message this does not count',
        'After second before third message',
        'Third message abc www'
      ].join("\n");
      var messages2 = [
        'Message 1 www',
        'Message 2 www',
        'Second last message abc',
        'Third and very last'
      ].join("\n");

      taskFunctions = this.tasksSetup(socialAnalysisTasks,
        {
          commitMessagesFilters: [
            /^\d+$/,
            function(w) { return w.length <= 2; },
            'and', 'after', 'before', 'very',
            /^xxx-/
          ]
        },
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', frequency: 'monthly', minWordCount: 2 }
      );

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'vcs_commit_messages_2016-01-01_2016-01-31.log'), messages1);
      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'vcs_commit_messages_2016-02-01_2016-02-28.log'), messages2);
    });

    it('publishes a report on the frequency of words in commit messages', function(done) {
      taskFunctions['commit-message-analysis']().then(function() {
        assertTaskReport(
          Path.join(outputDir, '7a52722f61ebbf6b67c3052225297ec62701debb', '2016-01-01_2016-01-31_commit-words-data.json'),
          [
            { text: 'message', count: 4 },
            { text: 'abc', count: 2 },
            { text: 'second', count: 2 },
            { text: 'third', count: 2 }
          ]
        );

        assertTaskReport(
          Path.join(outputDir, '7a52722f61ebbf6b67c3052225297ec62701debb', '2016-02-01_2016-02-28_commit-words-data.json'),
          [
            { text: 'message', count: 3 },
            { text: 'www', count: 2 },
            { text: 'last', count: 2 }
          ]
        );
        done();
      });
    });
  });

  describe('developer-effort-analysis', function() {
    beforeEach(function() {
      taskFunctions = this.tasksSetup(socialAnalysisTasks,
        {
          teamsComposition: {
            'Team 1': ['Dev1', 'Dev2'],
            'Team 2': ['Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
          }
        },
        { dateFrom: '2016-01-01' }
      );

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'effort-report.json'), JSON.stringify(
        [
          { path: "test/a/file1", author: 'Dev1', revisions: 5 },
          { path: "test/a/file1", author: 'Dev2', revisions: 2 },
          { path: "test/b/file2", author: 'Dev1', revisions: 8 },
          { path: "test/b/file2", author: 'Dev3', revisions: 5 },
          { path: "test/b/file2", author: 'Alias dev 4', revisions: 2 },
          { path: "test/c/file3", author: 'Dev5', revisions: 10 },
          { path: "test/c/file3", author: 'Dev with no team', revisions: 7 }
        ]
      ));
    });

    it('publishes reports on the revisions distribution between developers and between teams', function(done) {
      taskFunctions['developer-effort-analysis']().then(function() {
        assertTaskReport(
          Path.join(outputDir, '003a77e0e1ae9594f143f49d2b211269308c4489', '2016-01-01_2016-10-22_developer-effort-data.json'),
          {
            children: [
              {
                name: 'test',
                children: [
                  {
                    name: 'a',
                    children: [
                      {
                        name: 'file1',
                        children: [
                          { name: 'Dev1', revisions: 5, ownership: 71 },
                          { name: 'Dev2', revisions: 2, ownership: 29 }
                        ]
                      }
                    ]
                  },
                  {
                    name: 'b',
                    children: [
                      {
                        name: 'file2',
                        children: [
                          { name: 'Dev1', revisions: 8, ownership: 53 },
                          { name: 'Dev3', revisions: 5, ownership: 33 },
                          { name: 'Dev4', revisions: 2, ownership: 13 }
                        ]
                      }
                    ]
                  },
                  {
                    name: 'c',
                    children: [
                      {
                        name: 'file3',
                        children: [
                          { name: 'Dev5', revisions: 10, ownership: 59 },
                          { name: 'Dev with no team', revisions: 7, ownership: 41 }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        );

        assertTaskReport(
          Path.join(outputDir, '003a77e0e1ae9594f143f49d2b211269308c4489', '2016-01-01_2016-10-22_team-effort-data.json'),
          {
            children: [
              {
                name: 'test',
                children: [
                  {
                    name: 'a',
                    children: [
                      {
                        name: 'file1',
                        children: [
                          { name: 'Team 1', revisions: 7, ownership: 100 }
                        ]
                      }
                    ]
                  },
                  {
                    name: 'b',
                    children: [
                      {
                        name: 'file2',
                        children: [
                          { name: 'Team 1', revisions: 8, ownership: 53 },
                          { name: 'Team 2', revisions: 7, ownership: 47 }
                        ]
                      }
                    ]
                  },
                  {
                    name: 'c',
                    children: [
                      {
                        name: 'file3',
                        children: [
                          { name: 'Team 2', revisions: 10, ownership: 59 },
                          { name: 'N/A (Dev with no team)', revisions: 7, ownership: 41 }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        );

        done();
      });
    });
  });

  describe('authors-coupling-analysis', function() {
    beforeEach(function() {
      taskFunctions = this.tasksSetup(socialAnalysisTasks,
        {
          repository: { excludePaths: ['test_invalid_file'] },
          teamsComposition: {
            'Team 1': ['Dev1', 'Dev2'],
            'Team 2': ['Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
          }
        },
        { dateFrom: '2016-01-01', maxCoupledFiles: 2 }
      );

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'authors-report.json'), JSON.stringify(
        [
          { path: "test_file1", authors: 4, revisions: 54 },
          { path: "test_file2", authors: 2, revisions: 68 },
          { path: "test_file3", authors: 3, revisions: 24 },
          { path: "test_file4", authors: 5, revisions: 52 },
          { path: "test_file5", authors: 6, revisions: 91 },
          { path: "test_file6", authors: 1, revisions: 42 }
        ]
      ));

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'code-ownership-report.json'), JSON.stringify(
        [
          { path: "test_file1", author: 'Dev1', addedLines: 12, deletedLines: 4 },
          { path: "test_file1", author: 'Dev2', addedLines: 5, deletedLines: 0 },
          { path: "test_file1", author: 'Dev3', addedLines: 6, deletedLines: 1 },
          { path: "test_file2", author: 'Dev2', addedLines: 15, deletedLines: 5 },
          { path: "test_file2", author: 'Dev5', addedLines: 3, deletedLines: 2 },
          { path: "test_file3", author: 'Dev3', addedLines: 7, deletedLines: 3 },
          { path: "test_file3", author: 'Dev2', addedLines: 4, deletedLines: 1 },
          { path: "test_file4", author: 'Dev5', addedLines: 9, deletedLines: 0 },
          { path: "test_file4", author: 'Dev1', addedLines: 3, deletedLines: 0 },
          { path: "test_file5", author: 'Alias dev 4', addedLines: 5, deletedLines: 0 },
          { path: "test_file5", author: 'Dev4', addedLines: 5, deletedLines: 0 },
          { path: "test_file6", author: 'Dev5', addedLines: 14, deletedLines: 0 }
        ]
      ));

      _.each([
        'test_file1', 'test_file2', 'test_file3', 'test_file4', 'test_file5', 'test_file6', 'test_invalid_file'
        ], function(f) {
        fs.writeFileSync(Path.join(repoDir, f), '');
      });

    });

    it('publishes a report on files with the most authors and the respective coupling between main developers', function(done) {
      var couplingStream = new stream.PassThrough({ objectMode: true });
      spyOn(codeMaat.temporalCouplingAnalyser, 'fileAnalysisStream').and.returnValue(couplingStream);
      taskFunctions['authors-coupling-analysis']().then(function() {
        assertTaskReport(
          Path.join(outputDir, '1961adc0bbb3946a5401622e3905df77a9876312', '2016-01-01_2016-10-22_authors-coupling-data.json'),
          {
            children: [
              {
                path: 'test_file1',
                authors: 4,
                revisions: 54,
                mainDev: 'Dev1',
                ownership: 52,
                weight: 0.5934065934065934,
                coupledEntries: [
                  { path: 'test_file4', couplingDegree: 41, revisionsAvg: 22 },
                  { path: 'test_file3', couplingDegree: 23, revisionsAvg: 12 }
                ]
              },
              {
                path: 'test_file2',
                authors: 2,
                revisions: 68,
                mainDev: 'Dev2',
                ownership: 83,
                weight: 0.7472527472527473,
                coupledEntries: [
                  { path: 'test_file5', couplingDegree: 66, revisionsAvg: 31 }
                ]
              },
              {
                path: 'test_file3',
                authors: 3,
                revisions: 24,
                mainDev: 'Dev3',
                ownership: 64,
                weight: 0.26373626373626374,
                coupledEntries: [
                  { path: 'test_file5', couplingDegree: 49, revisionsAvg: 29 },
                  { path: 'test_file1', couplingDegree: 23, revisionsAvg: 12 }
                ]
              },
              {
                path: 'test_file4',
                authors: 5,
                revisions: 52,
                mainDev: 'Dev5',
                ownership: 75,
                weight: 0.5714285714285714,
                coupledEntries: [
                  { path: 'test_file1', couplingDegree: 41, revisionsAvg: 22 }
                ]
              },
              {
                path: 'test_file5',
                authors: 6,
                revisions: 91,
                mainDev: 'Dev4',
                ownership: 100,
                weight: 1,
                coupledEntries: [
                  { path: 'test_file2', couplingDegree: 66, revisionsAvg: 31 },
                  { path: 'test_file3', couplingDegree: 49, revisionsAvg: 29 }
                ]
              }
            ]
          }
        );
        done();
      });

      couplingStream.push({ path: 'test_invalid_file', coupledPath: 'test_file2', couplingDegree: 74, revisionsAvg: 68 });
      couplingStream.push({ path: 'test_file2', coupledPath: 'test_file5', couplingDegree: 66, revisionsAvg: 31 });
      couplingStream.push({ path: 'test_file5', coupledPath: 'test_file3', couplingDegree: 49, revisionsAvg: 29 });
      couplingStream.push({ path: 'test_file4', coupledPath: 'test_file1', couplingDegree: 41, revisionsAvg: 22 });
      couplingStream.push({ path: 'test_file1', coupledPath: 'test_file3', couplingDegree: 23, revisionsAvg: 12 });
      couplingStream.push({ path: 'test_file6', coupledPath: 'test_invalid_file', couplingDegree: 37, revisionsAvg: 18 });
      couplingStream.push({ path: 'test_file1', coupledPath: 'test_file5', couplingDegree: 30, revisionsAvg: 5 });
      couplingStream.end();
    });
  });
});
