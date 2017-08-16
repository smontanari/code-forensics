/*eslint-disable max-lines*/
var _      = require('lodash'),
    Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var socialAnalysisTasks = require_src('tasks/social_analysis_tasks'),
    codeMaat            = require_src('analysers/code_maat'),
    command             = require_src('command');

describe('Social analysis tasks', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2016-10-22T10:00:00.000Z'));
    spyOn(command.Command, 'ensure');
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

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

      this.runtime = this.runtimeSetup(socialAnalysisTasks,
        {
          commitMessageFilters: [
            /^\d+$/,
            function(w) { return w.length <= 2; },
            'and', 'after', 'before', 'very',
            /^xxx-/
          ]
        },
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom', minWordCount: 2 }
      );

      this.runtime.prepareTempFile('vcs_commit_messages_2016-01-01_2016-01-31.log', messages1);
      this.runtime.prepareTempFile('vcs_commit_messages_2016-02-01_2016-02-28.log', messages2);
    });

    afterEach(function() {
      this.clearTemp();
      this.clearOutput();
    });

    it('publishes a report on the frequency of words in commit messages', function(done) {
      this.runtime.executePromiseTask('commit-message-analysis').then(function(taskOutput) {
        taskOutput.assertOutputReport('2016-01-01_2016-01-31_commit-words-data.json',
          [
            { text: 'message', count: 4 },
            { text: 'abc', count: 2 },
            { text: 'second', count: 2 },
            { text: 'third', count: 2 }
          ]
        );

        taskOutput.assertOutputReport('2016-02-01_2016-02-28_commit-words-data.json',
          [
            { text: 'message', count: 3 },
            { text: 'www', count: 2 },
            { text: 'last', count: 2 }
          ]
        );

        taskOutput.assertManifest({
          reportName: 'commit-messages',
          parameters: { timeSplit: 'eom', minWordCount: 2 },
          dateRange: '2016-01-01_2016-02-28',
          enabledDiagrams: ['commit-words']
        });
        done();
      });
    });
  });

  describe('developer-effort-analysis', function() {
    afterEach(function() {
      this.clearTemp();
      this.clearOutput();
    });

    describe('when team information exists', function() {
      beforeEach(function() {
        this.runtime = this.runtimeSetup(socialAnalysisTasks,
          {
            contributors: {
              'Team 1': ['Dev1', 'Dev2'],
              'Team 2': ['Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
            }
          },
          { dateFrom: '2016-01-01' }
        );

        this.runtime.prepareTempReport('effort-report.json', [
          { path: "test/a/file1", author: 'Dev1', revisions: 5 },
          { path: "test/a/file1", author: 'Dev2', revisions: 2 },
          { path: "test/b/file2", author: 'Dev1', revisions: 8 },
          { path: "test/b/file2", author: 'Dev3', revisions: 5 },
          { path: "test/b/file2", author: 'Dev4', revisions: 2 },
          { path: "test/c/file3", author: 'Dev5', revisions: 10 },
          { path: "test/c/file3", author: 'Dev with no team', revisions: 7 }
        ]);
      });

      it('publishes reports on the revisions distribution between developers and between teams', function(done) {
        this.runtime.executePromiseTask('developer-effort-analysis').then(function(taskOutput) {
          taskOutput.assertOutputReport('2016-01-01_2016-10-22_developer-effort-data.json',
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

          taskOutput.assertOutputReport('2016-01-01_2016-10-22_team-effort-data.json',
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

          taskOutput.assertManifest({
            reportName: 'developer-effort',
            parameters: {},
            dateRange: '2016-01-01_2016-10-22',
            enabledDiagrams: ['individual-effort', 'team-effort']
          });
          done();
        });
      });
    });

    describe('when no team information exists', function() {
      beforeEach(function() {
        this.runtime = this.runtimeSetup(socialAnalysisTasks,
          {
            contributors: ['Dev1', 'Dev2', 'Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
          },
          { dateFrom: '2016-01-01' }
        );

        this.runtime.prepareTempReport('effort-report.json', [
          { path: "test/a/file1", author: 'Dev1', revisions: 5 },
          { path: "test/a/file1", author: 'Dev2', revisions: 2 },
          { path: "test/b/file2", author: 'Dev1', revisions: 8 },
          { path: "test/b/file2", author: 'Dev3', revisions: 5 },
          { path: "test/b/file2", author: 'Dev4', revisions: 2 },
          { path: "test/c/file3", author: 'Dev5', revisions: 10 },
          { path: "test/c/file3", author: 'Dev with no team', revisions: 7 }
        ]);
      });

      it('publishes only a report on the revisions distribution between developers', function(done) {
        this.runtime.executePromiseTask('developer-effort-analysis').then(function(taskOutput) {
          taskOutput.assertOutputReport('2016-01-01_2016-10-22_developer-effort-data.json',
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

          taskOutput.assertMissingOutputReport('2016-01-01_2016-10-22_team-effort-data.json');

          taskOutput.assertManifest({
            reportName: 'developer-effort',
            parameters: {},
            dateRange: '2016-01-01_2016-10-22',
            enabledDiagrams: ['individual-effort']
          });
          done();
        });
      });
    });
  });

  describe('developer-coupling-analysis', function() {
    beforeEach(function() {
      var runtime = this.runtime = this.runtimeSetup(socialAnalysisTasks,
        {
          repository: { excludePaths: ['test_invalid_file'] },
          contributors: {
            'Team 1': ['Dev1', 'Dev2'],
            'Team 2': ['Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
          }
        },
        { dateFrom: '2016-01-01', maxCoupledFiles: 2 }
      );

      _.each([
        'test_file1', 'test_file2', 'test_file3', 'test_file4', 'test_file5', 'test_file6', 'test_invalid_file'
        ], function(f) {
        runtime.prepareRepositoryFile(f, '');
      });
    });

    describe('when all analyses are supported for the VCS type', function() {
      var couplingStream, commAnalysisStream;

      beforeEach(function() {
        this.runtime.prepareTempReport('authors-report.json', [
          { path: "test_file1", authors: 4, revisions: 54 },
          { path: "test_file2", authors: 2, revisions: 68 },
          { path: "test_file3", authors: 3, revisions: 24 },
          { path: "test_file4", authors: 5, revisions: 52 },
          { path: "test_file5", authors: 6, revisions: 91 },
          { path: "test_file6", authors: 1, revisions: 42 }
        ]);

        this.runtime.prepareTempReport('code-ownership-report.json', [
          { path: "test_file1", author: 'Dev1', addedLines: 12, deletedLines: 4 },
          { path: "test_file1", author: 'Dev2', addedLines: 5, deletedLines: 0 },
          { path: "test_file1", author: 'Dev3', addedLines: 6, deletedLines: 1 },
          { path: "test_file2", author: 'Dev2', addedLines: 15, deletedLines: 5 },
          { path: "test_file2", author: 'Dev5', addedLines: 3, deletedLines: 2 },
          { path: "test_file3", author: 'Dev3', addedLines: 7, deletedLines: 3 },
          { path: "test_file3", author: 'Dev2', addedLines: 4, deletedLines: 1 },
          { path: "test_file4", author: 'Dev5', addedLines: 9, deletedLines: 0 },
          { path: "test_file4", author: 'Dev1', addedLines: 3, deletedLines: 0 },
          { path: "test_file5", author: 'Dev4', addedLines: 5, deletedLines: 0 },
          { path: "test_file5", author: 'Dev4', addedLines: 5, deletedLines: 0 },
          { path: "test_file6", author: 'Dev5', addedLines: 14, deletedLines: 0 }
        ]);

        couplingStream = new stream.PassThrough({ objectMode: true });
        commAnalysisStream = new stream.PassThrough({ objectMode: true });

        spyOn(codeMaat, 'analyser').and.callFake(function(instruction) {
          return {
            'entity-ownership': { isSupported: _.stubTrue },
            coupling: { isSupported: _.stubTrue, fileAnalysisStream: function() { return couplingStream; } },
            communication: { isSupported: _.stubTrue, fileAnalysisStream: function() { return commAnalysisStream; } }
          }[instruction];
        });
      });

      afterEach(function() {
        this.clearTemp();
        this.clearRepo();
        this.clearOutput();
      });

      it('publishes a report on ownership and communication coupling between main developers', function(done) {
        this.runtime.executePromiseTask('developer-coupling-analysis').then(function(taskOutput) {
          taskOutput.assertOutputReport('2016-01-01_2016-10-22_main-dev-coupling-data.json',
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

          taskOutput.assertOutputReport('2016-01-01_2016-10-22_communication-network-data.json', [
            { developer: { name: 'Dev1', team: 'Team 1' }, coupledDeveloper: { name: 'Dev2', team: 'Team 1' }, sharedCommits: 65, couplingStrength: 55 },
            { developer: { name: 'Dev3', team: 'Team 2' }, coupledDeveloper: { name: 'Dev1', team: 'Team 1' }, sharedCommits: 194, couplingStrength: 51 },
            { developer: { name: 'Dev4', team: 'Team 2' }, coupledDeveloper: { name: 'Dev5', team: 'Team 2' }, sharedCommits: 62, couplingStrength: 48 }
          ]);

          taskOutput.assertManifest({
            reportName: 'developer-coupling',
            parameters: { maxCoupledFiles: 2 },
            dateRange: '2016-01-01_2016-10-22',
            enabledDiagrams: ['main-developer-coupling', 'communication-network']
          });
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
        commAnalysisStream.push({ author: 'Dev1', coupledAuthor: 'Dev2', sharedCommits: 65, couplingStrength: 55 });
        commAnalysisStream.push({ author: 'Dev2', coupledAuthor: 'Dev1', sharedCommits: 65, couplingStrength: 55 });
        commAnalysisStream.push({ author: 'Dev3', coupledAuthor: 'Dev1', sharedCommits: 194, couplingStrength: 51 });
        commAnalysisStream.push({ author: 'Dev1', coupledAuthor: 'Dev3', sharedCommits: 194, couplingStrength: 51 });
        commAnalysisStream.push({ author: 'Dev4', coupledAuthor: 'Dev5', sharedCommits: 62, couplingStrength: 48 });
        commAnalysisStream.push({ author: 'Dev5', coupledAuthor: 'Dev4', sharedCommits: 62, couplingStrength: 48 });
        commAnalysisStream.end();
      });
    });

    describe('when the coupling analysis is not supported for the vcs type', function() {
      var commAnalysisStream;
      beforeEach(function() {
        commAnalysisStream = new stream.PassThrough({ objectMode: true });

        spyOn(codeMaat, 'analyser').and.callFake(function(instruction) {
          return {
            'entity-ownership': { isSupported: _.stubFalse },
            coupling: { isSupported: _.stubTrue },
            communication: { isSupported: _.stubTrue, fileAnalysisStream: function() { return commAnalysisStream; } }
          }[instruction];
        });
      });

      it('publishes a report on communication coupling only', function(done) {
        this.runtime.executePromiseTask('developer-coupling-analysis').then(function(taskOutput) {
          taskOutput.assertMissingOutputReport('2016-01-01_2016-10-22_main-dev-coupling-data.json');
          taskOutput.assertOutputReport('2016-01-01_2016-10-22_communication-network-data.json', [
            { developer: { name: 'Dev1', team: 'Team 1' }, coupledDeveloper: { name: 'Dev2', team: 'Team 1' }, sharedCommits: 65, couplingStrength: 55 },
            { developer: { name: 'Dev3', team: 'Team 2' }, coupledDeveloper: { name: 'Dev1', team: 'Team 1' }, sharedCommits: 194, couplingStrength: 51 },
            { developer: { name: 'Dev4', team: 'Team 2' }, coupledDeveloper: { name: 'Dev5', team: 'Team 2' }, sharedCommits: 62, couplingStrength: 48 }
          ]);

          taskOutput.assertManifest({
            reportName: 'developer-coupling',
            parameters: { maxCoupledFiles: 2 },
            dateRange: '2016-01-01_2016-10-22',
            enabledDiagrams: ['communication-network']
          });
          done();
        });

        commAnalysisStream.push({ author: 'Dev1', coupledAuthor: 'Dev2', sharedCommits: 65, couplingStrength: 55 });
        commAnalysisStream.push({ author: 'Dev2', coupledAuthor: 'Dev1', sharedCommits: 65, couplingStrength: 55 });
        commAnalysisStream.push({ author: 'Dev3', coupledAuthor: 'Dev1', sharedCommits: 194, couplingStrength: 51 });
        commAnalysisStream.push({ author: 'Dev1', coupledAuthor: 'Dev3', sharedCommits: 194, couplingStrength: 51 });
        commAnalysisStream.push({ author: 'Dev4', coupledAuthor: 'Dev5', sharedCommits: 62, couplingStrength: 48 });
        commAnalysisStream.push({ author: 'Dev5', coupledAuthor: 'Dev4', sharedCommits: 62, couplingStrength: 48 });
        commAnalysisStream.end();
      });
    });
  });

  describe('knowledge-map-analysis', function() {
    afterEach(function() {
      this.clearTemp();
      this.clearOutput();
    });

    describe('for a supported vcs type', function() {
      var prepareReports = function(runtime) {
        runtime.prepareTempReport('main-dev-report.json', [
          { path: 'test/ruby/app/file1.rb', author: 'Dev1', addedLines: 10, ownership: 53 },
          { path: 'test/web/styles/file2.css', author: 'Dev2', addedLines: 23, ownership: 26 },
          { path: 'test/ruby/app/models/file3.rb', author: 'Dev5', addedLines: 9, ownership: 44 },
          { path: 'test/web/js/file4.js', author: 'Dev4', addedLines: 16, ownership: 29 }
        ]);

        runtime.prepareTempReport('sloc-report.json', [
          { path: 'test/ruby/app/file1.rb', sourceLines: 33, totalLines: 45 },
          { path: 'test/web/styles/file2.css', sourceLines: 23, totalLines: 31 },
          { path: 'test/ruby/app/models/file3.rb', sourceLines: 15, totalLines: 21 },
          { path: 'test/web/js/file4.js', sourceLines: 25, totalLines: 35 }
        ]);
      };

      beforeEach(function() {
        spyOn(codeMaat, 'analyser').and.returnValue({ isSupported: _.stubTrue });
      });

      describe('when team information exists', function() {
        beforeEach(function() {
          this.runtime = this.runtimeSetup(socialAnalysisTasks,
            {
              contributors: {
                'Team 1': ['Dev1', 'Dev2'],
                'Team 2': ['Dev3', ['Dev4', 'Alias dev 4']],
                'Ex team': ['Dev5']
              }
            },
            { dateFrom: '2016-01-01' }
          );
          prepareReports(this.runtime);
        });

        it('publishes a report on the main developer for each file ', function(done) {
          this.runtime.executePromiseTask('knowledge-map-analysis').then(function(taskOutput) {
            taskOutput.assertOutputReport('2016-01-01_2016-10-22_knowledge-map-data.json',
              {
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
                                mainDev: 'Dev1',
                                team: 'Team 1',
                                addedLines: 10,
                                ownership: 53
                              },
                              {
                                name: 'models',
                                children: [
                                  {
                                    name: 'file3.rb',
                                    children: [],
                                    sourceLines: 15,
                                    totalLines: 21,
                                    mainDev: 'Dev5',
                                    team: 'Ex team',
                                    addedLines: 9,
                                    ownership: 44
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
                                mainDev: 'Dev2',
                                team: 'Team 1',
                                addedLines: 23,
                                ownership: 26
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
                                mainDev: 'Dev4',
                                team: 'Team 2',
                                addedLines: 16,
                                ownership: 29
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            );

            taskOutput.assertManifest({
              reportName: 'knowledge-map',
              parameters: {},
              dateRange: '2016-01-01_2016-10-22',
              enabledDiagrams: ['individual-knowledge-map', 'team-knowledge-map'],
            });

            done();
          });
        });
      });

      describe('when no team information exists', function() {
        beforeEach(function() {
          this.runtime = this.runtimeSetup(socialAnalysisTasks,
            {
              contributors: ['Dev1', 'Dev2', 'Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
            },
            { dateFrom: '2016-01-01' }
          );
          prepareReports(this.runtime);
        });

        it('publishes a report on the main developer for each file ', function(done) {
          this.runtime.executePromiseTask('knowledge-map-analysis').then(function(taskOutput) {
            taskOutput.assertOutputReport('2016-01-01_2016-10-22_knowledge-map-data.json',
              {
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
                                mainDev: 'Dev1',
                                addedLines: 10,
                                ownership: 53
                              },
                              {
                                name: 'models',
                                children: [
                                  {
                                    name: 'file3.rb',
                                    children: [],
                                    sourceLines: 15,
                                    totalLines: 21,
                                    mainDev: 'Dev5',
                                    addedLines: 9,
                                    ownership: 44
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
                                mainDev: 'Dev2',
                                addedLines: 23,
                                ownership: 26
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
                                mainDev: 'Dev4',
                                addedLines: 16,
                                ownership: 29
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            );

            taskOutput.assertManifest({
              reportName: 'knowledge-map',
              parameters: {},
              dateRange: '2016-01-01_2016-10-22',
              enabledDiagrams: ['individual-knowledge-map'],
            });

            done();
          });
        });
      });
    });

    describe('for an unsupported vcs type', function() {
      beforeEach(function() {
        this.runtime = this.runtimeSetup(socialAnalysisTasks,
          {
            contributors: ['Dev1', 'Dev2', 'Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
          },
          { dateFrom: '2016-01-01' }
        );
        spyOn(codeMaat, 'analyser').and.returnValue({ isSupported: _.stubFalse });
      });

      it('fails to publish the report ', function(done) {
        this.runtime.executePromiseTask('knowledge-map-analysis').then(function(taskOutput) {
          taskOutput.assertMissingReportId();
          done();
        });
      });
    });
  });
});
