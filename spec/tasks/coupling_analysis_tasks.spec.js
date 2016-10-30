var _      = require('lodash'),
    Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var couplingAnalysisTasks = require_src('tasks/coupling_analysis_tasks'),
    codeMaat              = require_src('analysers/code_maat');

describe('Coupling analysis tasks', function() {
  var taskFunctions, outputDir;

  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
    outputDir = this.tasksWorkingFolders.outputDir;
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  describe('sum-of-coupling-analysis', function() {
    beforeEach(function() {
      taskFunctions = this.tasksSetup(couplingAnalysisTasks,
        { repository: { excludePaths: ['test_invalid_file'] } },
        { dateFrom: '2015-03-01' }
      );

      var repoDir = this.tasksWorkingFolders.repoDir;
      _.each(['test_file1', 'test_file2', 'test_invalid_file'], function(f) {
        fs.writeFileSync(Path.join(repoDir, f), '');
      });
    });

    it('publishes a report on the sum of coupling for each file', function(done) {
      var analysisStream = new stream.PassThrough({ objectMode: true });
      spyOn(codeMaat.sumCouplingAnalyser, 'fileAnalysisStream').and.returnValue(analysisStream);

      taskFunctions['sum-of-coupling-analysis']().then(function() {
        var reportContent = fs.readFileSync(Path.join(outputDir, 'cccbd27e6e715fa48728f9f6363785835b73ba58', '2015-03-01_2015-10-22_sum-of-coupling-data.json'));
        var report = JSON.parse(reportContent.toString());
        expect(report).toEqual([
          { path: 'test_file1', soc: 34 },
          { path: 'test_file2', soc: 62 }
        ]);

        done();
      });

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

    beforeEach(function() {
      taskFunctions = this.tasksSetup(couplingAnalysisTasks,
        null,
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', frequency: 'monthly', targetFile: 'test/target_file' }
      );

      fs.writeFileSync(Path.join(this.tasksWorkingFolders.tempDir, 'sloc-report.json'), JSON.stringify([
        { path: 'test/a/file1', sloc: 33 },
        { path: 'test/b/file2', sloc: 23 },
        { path: 'test/c/file3', sloc: 15 },
        { path: 'test/d/file4', sloc: 25 },
        { path: 'test/target_file', sloc: 55 }
      ]));

    });

    it('publishes as many reports as the given time periods with coupling information between each file and a target file', function(done) {
      var couplingStream1 = new stream.PassThrough({ objectMode: true });
      var couplingStream2 = new stream.PassThrough({ objectMode: true });
      spyOn(codeMaat.temporalCouplingAnalyser, 'fileAnalysisStream').and.returnValues(couplingStream1, couplingStream2);

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
                        sloc: 33,
                        couplingDegree: 23,
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
                        sloc: 23,
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
                        sloc: 15,
                        couplingDegree: 30,
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
                        sloc: 25,
                        weight: 0
                      }
                    ]
                  },
                  {
                    name: 'target_file',
                    children: [],
                    sloc: 55,
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
                        sloc: 33,
                        couplingDegree: 10,
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
                        sloc: 23,
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
                        sloc: 15,
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
                        sloc: 25,
                        couplingDegree: 33,
                        weight: 1
                      }
                    ]
                  },
                  {
                    name: 'target_file',
                    children: [],
                    sloc: 55,
                    weight: 0
                  }
                ]
              }
            ]
          }
        );

        done();
      });

      couplingStream1.push({ path: 'test/a/file1', coupledPath: 'test/target_file', couplingDegree: 23, revisionsAvg: 12 });
      couplingStream1.push({ path: 'test/b/file2', coupledPath: 'test/a/file1', couplingDegree: 41, revisionsAvg: 22 });
      couplingStream1.push({ path: 'test/target_file', coupledPath: 'test/c/file3', couplingDegree: 30, revisionsAvg: 5 });
      couplingStream1.end();

      couplingStream2.push({ path: 'test/d/file4', coupledPath: 'test/target_file', couplingDegree: 33, revisionsAvg: 18 });
      couplingStream2.push({ path: 'test/c/file3', coupledPath: 'test/b/file2', couplingDegree: 52, revisionsAvg: 32 });
      couplingStream2.push({ path: 'test/target_file', coupledPath: 'test/a/file1', couplingDegree: 10, revisionsAvg: 30 });
      couplingStream2.end();
    });
  });
});
