/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "taskOutput.assert*", "runtime.assert*"] }] */
var _        = require('lodash'),
    Bluebird = require('bluebird'),
    stream   = require('stream'),
    lolex    = require('lolex');

var socialAnalysisTasks = require('tasks/social_analysis_tasks'),
    codeMaat            = require('analysers/code_maat'),
    command             = require('command');

var taskHelpers = require('../jest_tasks_helpers');

describe('Social analysis tasks', function() {
  var runtime, clock;

  beforeEach(function() {
    clock = lolex.install({ now: new Date('2016-10-22T10:00:00.000Z') });
    command.Command.ensure = jest.fn();
  });

  afterEach(function() {
    clock.uninstall();
    return runtime.clear();
  });

  describe('commit-message-analysis', function() {
    beforeEach(function() {
      var messages1 = [
        'First-only message abc 123',
        'Second message xxx-word 456',
        'xxx-message this does not count',
        'After second before third message',
        'Third message abc www'
      ].join('\n');
      var messages2 = [
        'Message 1 www',
        'Message 2 www',
        'Second last message abc',
        'Third and very last'
      ].join('\n');

      runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks,
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

      runtime.prepareTempFile('vcs_commit_messages_2016-01-01_2016-01-31.log', messages1);
      runtime.prepareTempFile('vcs_commit_messages_2016-02-01_2016-02-28.log', messages2);
    });

    it('has the required dependencies', function() {
      runtime.assertTaskDependencies('commit-message-analysis', ['vcsCommitMessages']);
    });

    it('publishes a report on the frequency of words in commit messages', function() {
      return runtime.executePromiseTask('commit-message-analysis').then(function(taskOutput) {
        return Bluebird.all([
          taskOutput.assertOutputReport('2016-01-01_2016-01-31_commit-words-data.json'),
          taskOutput.assertOutputReport('2016-02-01_2016-02-28_commit-words-data.json'),
          taskOutput.assertManifest()
        ]);
      });
    });
  });

  describe('developer-effort-analysis', function() {
    it('has the required dependencies', function() {
      runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks);
      runtime.assertTaskDependencies('developer-effort-analysis', ['vcsLogDump', 'effortReport']);
    });

    describe('when team information exists', function() {
      beforeEach(function() {
        runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks,
          {
            contributors: {
              'Team 1': ['Dev1', 'Dev2'],
              'Team 2': ['Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
            }
          },
          { dateFrom: '2016-01-01' }
        );

        runtime.prepareTempReport('effort-report.json', [
          { path: 'test/a/file1', author: 'Dev1', revisions: 5 },
          { path: 'test/a/file1', author: 'Dev2', revisions: 2 },
          { path: 'test/b/file2', author: 'Dev1', revisions: 8 },
          { path: 'test/b/file2', author: 'Dev3', revisions: 5 },
          { path: 'test/b/file2', author: 'Dev4', revisions: 2 },
          { path: 'test/c/file3', author: 'Dev5', revisions: 10 },
          { path: 'test/c/file3', author: 'Dev with no team', revisions: 7 },
          { path: 'test/test_invalid_file', author: 'Dev3', revisions: 10 }
        ]);

        [
          'test/a/file1',
          'test/b/file2',
          'test/c/file3'
        ].forEach(function(f) { runtime.prepareRepositoryFile(f, ''); });
      });

      it('publishes reports on the revisions distribution between developers and between teams', function() {
        return runtime.executePromiseTask('developer-effort-analysis').then(function(taskOutput) {
          return Bluebird.all([
            taskOutput.assertOutputReport('2016-01-01_2016-10-22_developer-effort-data.json'),
            taskOutput.assertOutputReport('2016-01-01_2016-10-22_team-effort-data.json'),
            taskOutput.assertManifest()
          ]);
        });
      });
    });

    describe('when no team information exists', function() {
      beforeEach(function() {
        runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks,
          {
            contributors: ['Dev1', 'Dev2', 'Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
          },
          { dateFrom: '2016-01-01' }
        );

        runtime.prepareTempReport('effort-report.json', [
          { path: 'test/a/file1', author: 'Dev1', revisions: 5 },
          { path: 'test/a/file1', author: 'Dev2', revisions: 2 },
          { path: 'test/b/file2', author: 'Dev1', revisions: 8 },
          { path: 'test/b/file2', author: 'Dev3', revisions: 5 },
          { path: 'test/b/file2', author: 'Dev4', revisions: 2 },
          { path: 'test/c/file3', author: 'Dev5', revisions: 10 },
          { path: 'test/c/file3', author: 'Dev with no team', revisions: 7 },
          { path: 'test/test_invalid_file', author: 'Dev3', revisions: 10 }
        ]);

        [
          'test/a/file1',
          'test/b/file2',
          'test/c/file3'
        ].forEach(function(f) { runtime.prepareRepositoryFile(f, ''); });
      });

      it('publishes only a report on the revisions distribution between developers', function() {
        return runtime.executePromiseTask('developer-effort-analysis').then(function(taskOutput) {
          return Bluebird.all([
            taskOutput.assertOutputReport('2016-01-01_2016-10-22_developer-effort-data.json'),
            taskOutput.assertMissingOutputReport('2016-01-01_2016-10-22_team-effort-data.json'),
            taskOutput.assertManifest()
          ]);
        });
      });
    });
  });

  describe('developer-coupling-analysis', function() {
    beforeEach(function() {
      codeMaat.analyser = jest.fn();
      runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks,
        {
          contributors: {
            'Team 1': ['Dev1', 'Dev2'],
            'Team 2': ['Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
          }
        },
        { dateFrom: '2016-01-01', maxCoupledFiles: 2 }
      );

      [
        'test_file1', 'test_file2', 'test_file3', 'test_file4', 'test_file5', 'test_file6'
      ].forEach(function(f) {
        runtime.prepareRepositoryFile(f, '');
      });
    });

    it('has the required dependencies', function() {
      runtime.assertTaskDependencies('developer-coupling-analysis', ['vcsLogDump', 'authorsReport', 'codeOwnershipReport']);
    });

    describe('when all analyses are supported for the VCS type', function() {
      var couplingStream, commAnalysisStream;

      beforeEach(function() {
        runtime.prepareTempReport('authors-report.json', [
          { path: 'test_file1', authors: 4, revisions: 54 },
          { path: 'test_file2', authors: 2, revisions: 68 },
          { path: 'test_file3', authors: 3, revisions: 24 },
          { path: 'test_file4', authors: 5, revisions: 52 },
          { path: 'test_file5', authors: 6, revisions: 91 },
          { path: 'test_file6', authors: 1, revisions: 42 }
        ]);

        runtime.prepareTempReport('code-ownership-report.json', [
          { path: 'test_file1', author: 'Dev1', addedLines: 12, deletedLines: 4 },
          { path: 'test_file1', author: 'Dev2', addedLines: 5, deletedLines: 0 },
          { path: 'test_file1', author: 'Dev3', addedLines: 6, deletedLines: 1 },
          { path: 'test_file2', author: 'Dev2', addedLines: 15, deletedLines: 5 },
          { path: 'test_file2', author: 'Dev5', addedLines: 3, deletedLines: 2 },
          { path: 'test_file3', author: 'Dev3', addedLines: 7, deletedLines: 3 },
          { path: 'test_file3', author: 'Dev2', addedLines: 4, deletedLines: 1 },
          { path: 'test_file4', author: 'Dev5', addedLines: 9, deletedLines: 0 },
          { path: 'test_file4', author: 'Dev1', addedLines: 3, deletedLines: 0 },
          { path: 'test_file5', author: 'Dev4', addedLines: 5, deletedLines: 0 },
          { path: 'test_file5', author: 'Dev4', addedLines: 5, deletedLines: 0 },
          { path: 'test_file6', author: 'Dev5', addedLines: 14, deletedLines: 0 }
        ]);

        couplingStream = new stream.PassThrough({ objectMode: true });
        commAnalysisStream = new stream.PassThrough({ objectMode: true });

        codeMaat.analyser.mockImplementation(function(instruction) {
          return {
            'entity-ownership': { isSupported: _.stubTrue },
            coupling: { isSupported: _.stubTrue, fileAnalysisStream: function() { return couplingStream; } },
            communication: { isSupported: _.stubTrue, fileAnalysisStream: function() { return commAnalysisStream; } }
          }[instruction];
        });
      });

      it('publishes a report on ownership and communication coupling between main developers', function() {
        return new Bluebird(function(done) {
          runtime.executePromiseTask('developer-coupling-analysis')
            .then(function(taskOutput) {
              return Bluebird.all([
                taskOutput.assertOutputReport('2016-01-01_2016-10-22_main-dev-coupling-data.json'),
                taskOutput.assertOutputReport('2016-01-01_2016-10-22_communication-network-data.json'),
                taskOutput.assertManifest()
              ]);
            })
            .then(function() { done(); })
            .catch(done.fail);

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
    });

    describe('when the coupling analysis is not supported for the vcs type', function() {
      var commAnalysisStream;
      beforeEach(function() {
        commAnalysisStream = new stream.PassThrough({ objectMode: true });

        codeMaat.analyser.mockImplementation(function(instruction) {
          return {
            'entity-ownership': { isSupported: _.stubFalse },
            coupling: { isSupported: _.stubTrue },
            communication: { isSupported: _.stubTrue, fileAnalysisStream: function() { return commAnalysisStream; } }
          }[instruction];
        });
      });

      it('publishes a report on communication coupling only', function() {
        return new Bluebird(function(done) {
          runtime.executePromiseTask('developer-coupling-analysis').then(function(taskOutput) {
            return Bluebird.all([
              taskOutput.assertMissingOutputReport('2016-01-01_2016-10-22_main-dev-coupling-data.json'),
              taskOutput.assertOutputReport('2016-01-01_2016-10-22_communication-network-data.json'),
              taskOutput.assertManifest()
            ]);
          })
          .then(function() { done(); })
          .catch(done.fail);

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
  });

  describe('knowledge-map-analysis', function() {
    it('has the required dependencies', function() {
      runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks);
      runtime.assertTaskDependencies('knowledge-map-analysis', ['vcsLogDump', 'slocReport', 'mainDevReport']);
    });

    describe('for a supported vcs type', function() {
      var prepareReports = function(runtime) {
        runtime.prepareTempReport('main-dev-report.json', [
          { path: 'test/ruby/app/file1.rb', author: 'Dev1', addedLines: 10, ownership: 53 },
          { path: 'test/web/styles/file2.css', author: 'Dev2', addedLines: 23, ownership: 26 },
          { path: 'test/ruby/app/models/file3.rb', author: 'Dev5', addedLines: 9, ownership: 44 },
          { path: 'test/web/js/file4.js', author: 'Dev4', addedLines: 16, ownership: 29 },
          { path: 'test/non/existing/file.rb', author: 'Dev1', addedLines: 34, ownership: 46 }
        ]);

        runtime.prepareTempReport('sloc-report.json', [
          { path: 'test/ruby/app/file1.rb', sourceLines: 33, totalLines: 45 },
          { path: 'test/web/styles/file2.css', sourceLines: 23, totalLines: 31 },
          { path: 'test/ruby/app/models/file3.rb', sourceLines: 15, totalLines: 21 },
          { path: 'test/web/js/file4.js', sourceLines: 25, totalLines: 35 }
        ]);
      };

      beforeEach(function() {
        codeMaat.analyser = jest.fn().mockReturnValue({ isSupported: _.stubTrue });
      });

      describe('when team information exists', function() {
        beforeEach(function() {
          runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks,
            {
              contributors: {
                'Team 1': ['Dev1', 'Dev2'],
                'Team 2': ['Dev3', ['Dev4', 'Alias dev 4']],
                'Ex team': ['Dev5']
              }
            },
            { dateFrom: '2016-01-01' }
          );
          prepareReports(runtime);
        });

        it('publishes a report on the main developer for each file ', function() {
          return runtime.executePromiseTask('knowledge-map-analysis').then(function(taskOutput) {
            return Bluebird.all([
              taskOutput.assertOutputReport('2016-01-01_2016-10-22_knowledge-map-data.json'),
              taskOutput.assertManifest()
            ]);
          });
        });
      });

      describe('when no team information exists', function() {
        beforeEach(function() {
          runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks,
            {
              contributors: ['Dev1', 'Dev2', 'Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
            },
            { dateFrom: '2016-01-01' }
          );
          prepareReports(runtime);
        });

        it('publishes a report on the main developer for each file ', function() {
          return runtime.executePromiseTask('knowledge-map-analysis').then(function(taskOutput) {
            return Bluebird.all([
              taskOutput.assertOutputReport('2016-01-01_2016-10-22_knowledge-map-data.json'),
              taskOutput.assertManifest()
            ]);
          });
        });
      });
    });

    describe('for an unsupported vcs type', function() {
      beforeEach(function() {
        runtime = taskHelpers.createRuntime('social_analysis_tasks', socialAnalysisTasks,
          {
            contributors: ['Dev1', 'Dev2', 'Dev3', ['Dev4', 'Alias dev 4'], 'Dev5']
          },
          { dateFrom: '2016-01-01' }
        );
        codeMaat.analyser = jest.fn().mockReturnValue({ isSupported: _.stubFalse });
      });

      it('fails to publish the report ', function() {
        return runtime.executePromiseTask('knowledge-map-analysis').then(function(taskOutput) {
          return taskOutput.assertMissingReportId();
        });
      });
    });
  });
});
