/*global require_src cfHelpers*/
var _        = require('lodash'),
    Bluebird = require('bluebird'),
    stream   = require('stream');

var rubyTasks = require_src('tasks/complexity_analysis/ruby_tasks'),
    vcs       = require_src('vcs'),
    command   = require_src('command');

describe('ruby tasks', function() {
  var runtime;
  beforeEach(function() {
    spyOn(command.Command, 'ensure');
  });

  describe('ruby-complexity-report', function() {
    var analysisStream1, analysisStream2;

    var assertReport = function(taskOutput) {
      return taskOutput.assertTempReport('ruby-complexity-report.json', [
        {
          path: 'test_file1.rb', totalComplexity: 22, averageComplexity: 7.3,
          methodComplexity: [
            { name: 'main#none', complexity: 18.6 },
            { name: 'chain#linking_to          /absolute/path/test_file1.rb:8', complexity: 1.7 }
          ]
        },
        {
          path: 'test_file3.rb', totalComplexity: 95.1, averageComplexity: 8.6,
          methodComplexity: [
            { name: 'Module::TestFile2#test_method /absolute/path/test_file3.rb:54', complexity: 26.2 }
          ]
        }
      ]);
    };

    beforeEach(function() {
      analysisStream1 = new stream.PassThrough();
      analysisStream2 = new stream.PassThrough();
      spyOn(command, 'stream').and.returnValues(analysisStream1, analysisStream2);

      runtime = cfHelpers.runtimeSetup(rubyTasks);
      _.each(['test_file1.rb', 'test_file2.js', 'test_file3.rb'], function(f) {
        runtime.prepareRepositoryFile(f, '');
      });
    });

    var streamData = function() {
      _.each([
        '\t22.0: flog total\n',
        '\t 7.3: flog/method average\n'
      ], function(line) {
        analysisStream1.push(line);
      });
      _.each([
        '\t95.1: flog total\n',
        '\t 8.6: flog/method average\n',
        '\n',
        '\t26.2: Module::TestFile2#test_method /absolute/path/test_file3.rb:54'
      ], function(line) { analysisStream2.push(line); });
      _.each([
        '\n',
        '\t18.6: main#none\n',
        '\t 1.7: chain#linking_to          /absolute/path/test_file1.rb:8\n'
      ], function(line) { analysisStream1.push(line); });

      analysisStream2.end();
      analysisStream1.end();
    };

    afterEach(function() {
      cfHelpers.clearRepo();
      cfHelpers.clearTemp();
    });

    describe('as a Task', function() {
      it('writes a report on the complexity for each ruby file in the repository', function(done) {
        runtime.executeStreamTask('ruby-complexity-report')
          .then(assertReport)
          .then(done)
          .catch(done.fail);

        streamData();
      });
    });

    describe('as a Function', function() {
      it('writes a report on the complexity for each ruby file in the repository', function(done) {
        runtime.executeStreamFunction('rubyComplexityReport')
          .then(assertReport)
          .then(done)
          .catch(done.fail);

        streamData();
      });
    });
  });

  describe('ruby-complexity-trend-analysis', function() {
    var mockVcs;

    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
      mockVcs = jasmine.createSpyObj('vcsClient', ['revisions', 'showRevisionStream']);
      spyOn(vcs, 'client').and.returnValue(mockVcs);
    });

    afterEach(function() {
      jasmine.clock().uninstall();
      cfHelpers.clearOutput();
    });

    it('publishes an analysis on the complexity trend for a given ruby file in the repository', function(done) {
      var revisionStream1 = new stream.PassThrough();
      var revisionStream2 = new stream.PassThrough();
      var complexityStream1 = new stream.PassThrough();
      var complexityStream2 = new stream.PassThrough();

      mockVcs.revisions.and.returnValue([
        { revisionId: 123, date: '2015-04-29T23:00:00.000Z' },
        { revisionId: 456, date: '2015-05-04T23:00:00.000Z' }
      ]);
      mockVcs.showRevisionStream.and.returnValues(revisionStream1, revisionStream2);
      spyOn(command, 'createAsync').and.returnValues(
        { stdin: new stream.PassThrough(), stdout: complexityStream1 },
        { stdin: new stream.PassThrough(), stdout: complexityStream2 }
      );

      var runtime = cfHelpers.runtimeSetup(rubyTasks, null, { dateFrom: '2015-03-01', targetFile: 'test_abs.rb' });
      runtime.executePromiseTask('ruby-complexity-trend-analysis').then(function(taskOutput) {
        return Bluebird.all([
          taskOutput.assertOutputReport('2015-03-01_2015-10-22_complexity-trend-data.json', [
            {
              revision: 123,
              date: '2015-04-29T23:00:00.000Z',
              path: 'test_abs.rb',
              totalComplexity: 22.0,
              averageComplexity: 7.3,
              methodComplexity: [
                { name: 'main#none', complexity: 18.6 },
                { name: 'chain#linking_to          /absolute/path/test_abs.rb:8', complexity: 1.7 }
              ]
            },
            {
              revision: 456,
              date: '2015-05-04T23:00:00.000Z',
              path: 'test_abs.rb',
              totalComplexity: 95.1,
              averageComplexity: 8.6,
              methodComplexity: [
                { name: 'Module::TestFile2#test_method /absolute/path/test_abs.rb:54', complexity: 26.2 }
              ]
            }
          ]),
          taskOutput.assertManifest({
            reportName: 'complexity-trend',
            parameters: { targetFile: 'test_abs.rb' },
            dateRange: '2015-03-01_2015-10-22',
            enabledDiagrams: ['total', 'func-mean', 'func-sd']
          })
        ]);
      })
      .then(done)
      .catch(done.fail);

      revisionStream1.push('def abs(a,b)\n');
      revisionStream1.push('a - b\nend');
      revisionStream1.end();

      revisionStream2.push('def abs(a,b)\n');
      revisionStream2.push('return b - a if (a < b)\n');
      revisionStream2.push('a - b\n');
      revisionStream2.push('end\n');
      revisionStream2.end();

      complexityStream1.push(
        '\t22.0: flog total\n' +
        '\t 7.3: flog/method average\n' +
        '\n' +
        '\t18.6: main#none\n' +
        '\t 1.7: chain#linking_to          /absolute/path/test_abs.rb:8\n'
      );
      complexityStream1.end();

      complexityStream2.push(
        '\t95.1: flog total\n' +
        '\t 8.6: flog/method average\n' +
        '\n' +
        '\t26.2: Module::TestFile2#test_method /absolute/path/test_abs.rb:54'
      );
      complexityStream2.end();
    });
  });
});
