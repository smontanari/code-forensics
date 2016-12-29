/*eslint-disable max-lines*/
var _      = require('lodash'),
    Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var couplingAnalysisTasks = require_src('tasks/coupling_analysis_tasks'),
    codeMaat              = require_src('analysers/code_maat'),
    command               = require_src('command');

describe('Coupling analysis tasks', function() {
  var taskFunctions, outputDir;

  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
    outputDir = this.tasksWorkingFolders.outputDir;
    spyOn(command.Command, 'ensure');
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  describe('sum-of-coupling-analysis', function() {
    beforeEach(function() {
      var repoDir = this.tasksWorkingFolders.repoDir;
      _.each(['test_file1', 'test_file2', 'test_invalid_file'], function(f) {
        fs.writeFileSync(Path.join(repoDir, f), '');
      });

      taskFunctions = this.tasksSetup(couplingAnalysisTasks,
        { repository: { excludePaths: ['test_invalid_file'] } },
        { dateFrom: '2015-03-01' }
      );
    });

    afterEach(function() {
      this.clearRepo();
      this.clearOutput();
    });

    it('publishes a report on the sum of coupling for each file', function(done) {
      var analysisStream = new stream.PassThrough({ objectMode: true });
      spyOn(codeMaat, 'analyser').and.returnValue(
        { fileAnalysisStream: function() { return analysisStream; } }
      );

      taskFunctions['sum-of-coupling-analysis']().then(function() {
        var reportContent = fs.readFileSync(Path.join(outputDir, 'cccbd27e6e715fa48728f9f6363785835b73ba58', '2015-03-01_2015-10-22_sum-of-coupling-data.json'));
        var report = JSON.parse(reportContent.toString());
        expect(report).toEqual([
          { path: 'test_file1', soc: 34 },
          { path: 'test_file2', soc: 62 }
        ]);

        done();
      }).catch(function(err) {
        fail(err);
      });

      expect(codeMaat.analyser).toHaveBeenCalledWith('soc');
      analysisStream.push({ path: 'test_file1', soc: 34 });
      analysisStream.push({ path: 'test_file2', soc: 62 });
      analysisStream.push({ path: 'test_invalid_file', soc: 23 });
      analysisStream.end();
    });
  });

  describe('temporal-coupling-analysis', function() {
    var assertTaskReport = function(file, content) {
      var reportContent = fs.readFileSync(file);
      var report = JSON.parse(reportContent.toString());
      expect(report).toEqual(content);
    };

    var couplingStreamsData = [
      [
        { path: 'test/a/file1', coupledPath: 'test/target_file', couplingDegree: 23, revisionsAvg: 12 },
        { path: 'test/b/file2', coupledPath: 'test/a/file1', couplingDegree: 41, revisionsAvg: 22 },
        { path: 'test/target_file', coupledPath: 'test/c/file3', couplingDegree: 30, revisionsAvg: 5 }
      ],
      [
        { path: 'test/d/file4', coupledPath: 'test/target_file', couplingDegree: 33, revisionsAvg: 18 },
        { path: 'test/c/file3', coupledPath: 'test/b/file2', couplingDegree: 52, revisionsAvg: 32 },
        { path: 'test/target_file', coupledPath: 'test/a/file1', couplingDegree: 10, revisionsAvg: 30 }
      ]
    ];

    var churnStreamsData = [
      [
        { path: 'test/a/file1', addedLines: 295, deletedLines: 209, commits: 20 },
        { path: 'test/b/file2', addedLines:  40, deletedLines:  61, commits:  4 },
        { path: 'test/target_file', addedLines: 150, deletedLines: 60, commits:  31 },
        { path: 'test/c/file3', addedLines:  71, deletedLines:  37, commits: 12 }
      ],
      [
        { path: 'test/target_file', addedLines: 50, deletedLines: 10, commits:  13 },
        { path: 'test/d/file4', addedLines:  91, deletedLines: 38, commits: 7 },
        { path: 'test/a/file1', addedLines: 147, deletedLines: 56, commits: 6 },
        { path: 'test/b/file2', addedLines:  19, deletedLines:  6, commits: 3 }
      ]
    ];

    beforeEach(function() {
      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'sloc-report.json'), JSON.stringify([
        { path: 'test/a/file1', sourceLines: 33, totalLines: 35 },
        { path: 'test/b/file2', sourceLines: 23, totalLines: 28 },
        { path: 'test/c/file3', sourceLines: 15, totalLines: 21 },
        { path: 'test/d/file4', sourceLines: 25, totalLines: 35 },
        { path: 'test/target_file', sourceLines: 55, totalLines: 62 }
      ]));

      taskFunctions = this.tasksSetup(couplingAnalysisTasks,
        null,
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', timeSplit: 'eom', targetFile: 'test/target_file' }
      );
    });

    afterEach(function() {
      this.clearTemp();
      this.clearOutput();
    });

    it('publishes as many reports as the given time periods with coupling information between each file and a target file', function(done) {
      var couplingStreams = [
        new stream.PassThrough({ objectMode: true }),
        new stream.PassThrough({ objectMode: true })
      ];
      var churnStreams = [
        new stream.PassThrough({ objectMode: true }),
        new stream.PassThrough({ objectMode: true })
      ];

      var couplingAnalysisIndex = 0,
          churnAnalysisIndex = 0;
      spyOn(codeMaat, 'analyser').and.callFake(function(analysis) {
        if (analysis === 'coupling') {
          return { fileAnalysisStream: jasmine.createSpy().and.returnValues(couplingStreams[couplingAnalysisIndex++]) };
        }
        if (analysis === 'entity-churn') {
          return { fileAnalysisStream: jasmine.createSpy().and.returnValues(churnStreams[churnAnalysisIndex++]) };
        }
      });

      taskFunctions['temporal-coupling-analysis']().then(function() {
        assertTaskReport(
          Path.join(outputDir, '7a25dcda038c13953d38dcf1969cf09fadf23ad0', '2016-01-01_2016-01-31_temporal-coupling-data.json'),
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
                        children: [],
                        sourceLines: 33,
                        totalLines: 35,
                        couplingDegree: 23,
                        revisionsAvg: 12,
                        addedLines: 295,
                        deletedLines: 209,
                        weight: 0.7666666666666667
                      }
                    ]
                  },
                  {
                    name: 'b',
                    children: [
                      {
                        name: 'file2',
                        children: [],
                        sourceLines: 23,
                        totalLines: 28,
                        addedLines:  40,
                        deletedLines:  61,
                        weight: 0
                      }
                    ]
                  },
                  {
                    name: 'c',
                    children: [
                      {
                        name: 'file3',
                        children: [],
                        sourceLines: 15,
                        totalLines: 21,
                        revisionsAvg: 5,
                        couplingDegree: 30,
                        addedLines:  71,
                        deletedLines:  37,
                        weight: 1
                      }
                    ]
                  },
                  {
                    name: 'd',
                    children: [
                      {
                        name: 'file4',
                        children: [],
                        sourceLines: 25,
                        totalLines: 35,
                        weight: 0
                      }
                    ]
                  },
                  {
                    name: 'target_file',
                    children: [],
                    sourceLines: 55,
                    totalLines: 62,
                    addedLines: 150,
                    deletedLines: 60,
                    weight: 0
                  }
                ]
              }
            ]
          }
        );

        assertTaskReport(
          Path.join(outputDir, '7a25dcda038c13953d38dcf1969cf09fadf23ad0', '2016-02-01_2016-02-28_temporal-coupling-data.json'),
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
                        children: [],
                        sourceLines: 33,
                        totalLines: 35,
                        revisionsAvg: 30,
                        couplingDegree: 10,
                        addedLines: 147,
                        deletedLines: 56,
                        weight: 0.30303030303030304
                      }
                    ]
                  },
                  {
                    name: 'b',
                    children: [
                      {
                        name: 'file2',
                        children: [],
                        sourceLines: 23,
                        totalLines: 28,
                        addedLines:  19,
                        deletedLines:  6,
                        weight: 0
                      }
                    ]
                  },
                  {
                    name: 'c',
                    children: [
                      {
                        name: 'file3',
                        children: [],
                        sourceLines: 15,
                        totalLines: 21,
                        weight: 0
                      }
                    ]
                  },
                  {
                    name: 'd',
                    children: [
                      {
                        name: 'file4',
                        children: [],
                        sourceLines: 25,
                        totalLines: 35,
                        revisionsAvg: 18,
                        couplingDegree: 33,
                        addedLines:  91,
                        deletedLines: 38,
                        weight: 1
                      }
                    ]
                  },
                  {
                    name: 'target_file',
                    children: [],
                    sourceLines: 55,
                    totalLines: 62,
                    addedLines: 50,
                    deletedLines: 10,
                    weight: 0
                  }
                ]
              }
            ]
          }
        );

        done();
      });

      _.each(couplingStreams, function(s, index) {
        _.each(couplingStreamsData[index], s.push.bind(s));
        s.end();
      });
      _.each(churnStreams, function(s, index) {
        _.each(churnStreamsData[index], s.push.bind(s));
        s.end();
      });
    });
  });
});
