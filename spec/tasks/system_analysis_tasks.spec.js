var Path   = require('path'),
    fs     = require('fs'),
    stream = require('stream');

var systemAnalysisTasks = require_src('tasks/system_analysis_tasks'),
    codeMaat            = require_src('analysers/code_maat');

describe('System analysis tasks', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2015-10-22T10:00:00.000Z'));
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  describe('system-evolution-analysis', function() {
    var assertTaskReport = function(file, content) {
      var reportContent = fs.readFileSync(file);
      var report = JSON.parse(reportContent.toString());
      expect(report).toEqual(content);
    };

    it('publishes a revisions report and a coupling report for each architectural layer of the system', function(done) {
      var couplingStream1 = new stream.PassThrough({ objectMode: true });
      var couplingStream2 = new stream.PassThrough({ objectMode: true });
      spyOn(codeMaat.temporalCouplingAnalyser, 'fileAnalysisStream').and.returnValues(couplingStream1, couplingStream2);

      var revisionsStream1 = new stream.PassThrough({ objectMode: true });
      var revisionsStream2 = new stream.PassThrough({ objectMode: true });
      spyOn(codeMaat.revisionsAnalyser, 'fileAnalysisStream').and.returnValues(revisionsStream1, revisionsStream2);

      var taskFunctions = this.tasksSetup(systemAnalysisTasks, null,
        { dateFrom: '2016-01-01', dateTo: '2016-02-28', frequency: 'monthly', boundary: 'test-boundary' }
      );
      var outputDir = this.tasksWorkingFolders.outputDir;


      taskFunctions['system-evolution-analysis']().then(function() {
        assertTaskReport(
          Path.join(outputDir, '376716484935bc38610b095a36fabbe9c01527ad', '2016-01-01_2016-02-28_system-coupling-data.json'),
          [
            { name: 'test_layer1', coupledName: 'test_layer2', couplingDegree: 23, date: '2016-01-31'},
            { name: 'test_layer1', coupledName: 'test_layer3', couplingDegree: 41, date: '2016-01-31'},
            { name: 'test_layer2', coupledName: 'test_layer3', couplingDegree: 30, date: '2016-01-31'},
            { name: 'test_layer1', coupledName: 'test_layer2', couplingDegree: 33, date: '2016-02-28'},
            { name: 'test_layer1', coupledName: 'test_layer3', couplingDegree: 52, date: '2016-02-28'},
            { name: 'test_layer2', coupledName: 'test_layer3', couplingDegree: 10, date: '2016-02-28'}
          ]
        );

        assertTaskReport(
          Path.join(outputDir, '376716484935bc38610b095a36fabbe9c01527ad', '2016-01-01_2016-02-28_system-revisions-data.json'),
          [
            { name: 'test_layer1', revisions: 32, date: '2016-01-31'},
            { name: 'test_layer2', revisions: 47, date: '2016-01-31'},
            { name: 'test_layer3', revisions: 15, date: '2016-01-31'},
            { name: 'test_layer1', revisions: 34, date: '2016-02-28'},
            { name: 'test_layer2', revisions: 25, date: '2016-02-28'},
            { name: 'test_layer3', revisions: 11, date: '2016-02-28'}
          ]
        );

        done();
      });

      couplingStream1.push({ path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 23, revisionsAvg: 12 });
      couplingStream1.push({ path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 41, revisionsAvg: 22 });
      couplingStream1.push({ path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 30, revisionsAvg: 5 });
      couplingStream1.end();

      couplingStream2.push({ path: 'test_layer1', coupledPath: 'test_layer2', couplingDegree: 33, revisionsAvg: 18 });
      couplingStream2.push({ path: 'test_layer1', coupledPath: 'test_layer3', couplingDegree: 52, revisionsAvg: 32 });
      couplingStream2.push({ path: 'test_layer2', coupledPath: 'test_layer3', couplingDegree: 10, revisionsAvg: 30 });
      couplingStream2.end();

      revisionsStream1.push({ path: 'test_layer1', revisions: 32 });
      revisionsStream1.push({ path: 'test_layer2', revisions: 47 });
      revisionsStream1.push({ path: 'test_layer3', revisions: 15 });
      revisionsStream1.end();

      revisionsStream2.push({ path: 'test_layer1', revisions: 34 });
      revisionsStream2.push({ path: 'test_layer2', revisions: 25 });
      revisionsStream2.push({ path: 'test_layer3', revisions: 11 });
      revisionsStream2.end();
    });
  });
});
