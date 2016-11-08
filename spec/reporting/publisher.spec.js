var fs = require('fs'),
    Q  = require('q');

var Publisher  = require_src('reporting/publisher'),
    utils      = require_src('utils'),
    TimePeriod = require_src('models').TimePeriod;

describe('Publisher', function() {
  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2013-10-22T13:00:00.000Z'));
    spyOn(fs, 'mkdir');
    this.context = {
      dateRange: new TimePeriod('start', 'finish'),
      outputDir: '/test/output',
      parameters: {
        param1: 'test_param1',
        param3: 'test_param3',
        dateFrom: 'test_date'
      }
    };
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  it('creates the output folder', function() {
    this.subject = new Publisher({ name: 'test-task' }, this.context);
    expect(fs.mkdir.calls.mostRecent().args[0]).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
  });

  describe('.addReportFile()', function() {
    describe('with no report file information', function() {
      it('raises an error adding a report file', function() {
        this.subject = new Publisher({ name: 'test-task' }, this.context);

        expect(this.subject.addReportFile.bind(this.subject)).toThrowError('Missing report file information');
        expect(this.subject.addReportFileForType.bind(this.subject, 'report-type')).toThrowError('Invalid report file type: report-type');
      });
    });

    describe('with one report file type', function() {
      beforeEach(function() {
        this.subject = new Publisher({
          name: 'test-task', reportFile: 'test-file.json'
        }, this.context);
      });

      describe('with no time period given', function() {
        it('returns the full path to the file corresponding to the date range', function() {
          var filepath = this.subject.addReportFile();

          expect(filepath).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/start_finish_test-file.json');
        });
      });

      describe('with a given time period', function() {
        it('returns the full path to the file corresponding to the time period', function() {
          var filepath = this.subject.addReportFile(new TimePeriod('begin', 'end'));

          expect(filepath).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/begin_end_test-file.json');
        });
      });

      describe('with incorrect report file information', function() {
        it('raises an error when adding a report file', function() {
          expect(this.subject.addReportFileForType.bind(this.subject, 'report-type')).toThrowError('Invalid report file type: report-type');
        });
      });
    });

    describe('with many report file types', function() {
      beforeEach(function() {
        this.subject = new Publisher({
          name: 'test-task',
          reportFiles: {
            'report-type1': 'test-file1.json',
            'report-type2': 'test-file2.json'
          }
        }, this.context);
      });

      describe('with no time period given', function() {
        it('returns the full path to the file corresponding to the date range', function() {
          var filepath = this.subject.addReportFileForType('report-type1');

          expect(filepath).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/start_finish_test-file1.json');
        });
      });

      describe('with a given time period', function() {
        it('returns the full path to the file corresponding to the time period', function() {
          var filepath = this.subject.addReportFileForType('report-type2', new TimePeriod('begin', 'end'));

          expect(filepath).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/begin_end_test-file2.json');
        });
      });

      describe('with incorrect report type information', function() {
        it('raises an error when adding a report file', function() {
          expect(this.subject.addReportFileForType.bind(this.subject, 'report-type3')).toThrowError('Invalid report file type: report-type3');
        });
      });
    });
  });

  describe('.createManifest()', function() {
    describe('with a report name', function() {
      beforeEach(function() {
        spyOn(utils.json, 'objectToFile').and.returnValue(Q());
        this.subject = new Publisher({
          name: 'test-task',
          reportName: 'test-report',
          reportFile: 'test-file.json'
        }, this.context);
        this.subject.addReportFile(new TimePeriod('p1Start', 'p1End'));
      });

      it('creates a manifest file', function(done) {
        this.subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
          expect(manifest.id).toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
          expect(manifest.reportName).toEqual('test-report');
          expect(manifest.taskName).toEqual('test-task');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('start_finish');
          expect(manifest.dataFiles).toEqual([
            { fileType: undefined, timePeriod: 'p1Start_p1End', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/p1Start_p1End_test-file.json'},
          ]);

          done();
        });
      });
    });

    describe('without a report name', function() {
      beforeEach(function() {
        spyOn(utils.json, 'objectToFile').and.returnValue(Q());
        this.subject = new Publisher({
          name: 'test-task',
          reportFile: 'test-file.json'
        }, this.context);
        this.subject.addReportFile(new TimePeriod('p1Start', 'p1End'));
      });

      it('creates a manifest file', function(done) {
        this.subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
          expect(manifest.id).toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
          expect(manifest.reportName).toEqual('test-task');
          expect(manifest.taskName).toEqual('test-task');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('start_finish');
          expect(manifest.dataFiles).toEqual([
            { fileType: undefined, timePeriod: 'p1Start_p1End', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/p1Start_p1End_test-file.json'},
          ]);

          done();
        });
      });
    });

    describe('with one report file type', function() {
      beforeEach(function() {
        spyOn(utils.json, 'objectToFile').and.returnValue(Q());
        this.subject = new Publisher({
          name: 'test-task',
          reportFile: 'test-file.json'
        }, this.context);
        this.subject.addReportFile(new TimePeriod('p2Start', 'p2End'));
        this.subject.addReportFile(new TimePeriod('p1Start', 'p1End'));
      });

      it('creates a manifest file', function(done) {
        this.subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
          expect(manifest.id).toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
          expect(manifest.taskName).toEqual('test-task');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('start_finish');
          expect(manifest.dataFiles).toEqual([
            { fileType: undefined, timePeriod: 'p1Start_p1End', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/p1Start_p1End_test-file.json'},
            { fileType: undefined, timePeriod: 'p2Start_p2End', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/p2Start_p2End_test-file.json'}
          ]);

          done();
        });
      });
    });

    describe('with many report file types', function() {
      beforeEach(function() {
        spyOn(utils.json, 'objectToFile').and.returnValue(Q());
        this.subject = new Publisher({
          name: 'test-task',
          reportFiles: {
            'report-type1': 'test-file1.json',
            'report-type2': 'test-file2.json'
          }
        }, this.context);
        this.subject.addReportFileForType('report-type2', new TimePeriod('p2Start', 'p2End'));
        this.subject.addReportFileForType('report-type1', new TimePeriod('p1Start', 'p1End'));
      });

      it('creates a manifest file', function(done) {
        this.subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
          expect(manifest.id).toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
          expect(manifest.taskName).toEqual('test-task');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('start_finish');
          expect(manifest.dataFiles).toEqual([
            { fileType: 'report-type1', timePeriod: 'p1Start_p1End', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/p1Start_p1End_test-file1.json'},
            { fileType: 'report-type2', timePeriod: 'p2Start_p2End', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/p2Start_p2End_test-file2.json'}
          ]);

          done();
        });
      });
    });

    describe('manifest parameters', function() {
      beforeEach(function() {
        spyOn(utils.json, 'objectToFile').and.returnValue(Q());
      });

      it('exposes the relevane context parameters for the analysis report', function(done) {
        new Publisher({
          name: 'test-task',
          parameters: [{ name: 'param1' }, { name: 'param2' }],
          reportFile: 'test-file.json'
        }, this.context).createManifest().then(function() {
          var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
          expect(manifest.parameters).toEqual({ param1: 'test_param1' });
          done();
        });
      });
    });
  });
});
