/*eslint-disable max-lines*/
var moment = require('moment'),
    mkdirp = require('mkdirp'),
    lolex  = require('lolex');

var Publisher  = require('reporting/publisher'),
    utils      = require('utils'),
    TimePeriod = require('models').TimePeriod;

jest.mock('mkdirp');

describe('Publisher', function() {
  var clock, context, subject;
  beforeEach(function() {
    clock = lolex.install({ now: new Date('2013-10-22T13:00:00.000Z') });

    context = {
      dateRange: new TimePeriod({ start: moment('2012-03-01'), end: moment('2012-07-31') }, 'YYYY-MM'),
      outputDir: '/test/output',
      parameters: {
        param1: 'test_param1',
        param3: 'test_param3',
        dateFrom: 'test_date'
      }
    };
  });

  afterEach(function() {
    clock.uninstall();
  });

  describe('.addReportFile()', function() {
    it('creates the output folder', function() {
      subject = new Publisher({ name: 'test-task', reportFile: 'test-file.json' }, context);

      subject.addReportFile();

      expect(mkdirp.sync).toHaveBeenLastCalledWith('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
    });

    describe('with no report file information', function() {
      it('raises an error adding a report file', function() {
        subject = new Publisher({ name: 'test-task' }, context);

        expect(subject.addReportFile.bind(subject)).toThrow('Missing report file information');
        expect(subject.addReportFileForType.bind(subject, 'report-type')).toThrow('Invalid report file type: report-type');
      });
    });

    describe('with one report file type', function() {
      beforeEach(function() {
        subject = new Publisher({
          name: 'test-task', reportFile: 'test-file.json'
        }, context);
      });

      describe('with no time period given', function() {
        it('returns the full path to the file corresponding to the date range', function() {
          var filepath = subject.addReportFile();

          expect(filepath).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-03_2012-07_test-file.json');
        });
      });

      describe('with a given time period', function() {
        it('returns the full path to the file corresponding to the time period', function() {
          var filepath = subject.addReportFile(new TimePeriod({ start: moment('2012-05-01'), end: moment('2012-05-31') }, 'YYYY-MM'));

          expect(filepath).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-05_2012-05_test-file.json');
        });
      });

      describe('with incorrect report file information', function() {
        it('raises an error when adding a report file', function() {
          expect(subject.addReportFileForType.bind(subject, 'report-type')).toThrow('Invalid report file type: report-type');
        });
      });
    });

    describe('with many report file types', function() {
      beforeEach(function() {
        subject = new Publisher({
          name: 'test-task',
          reportFiles: {
            'report-type1': 'test-file1.json',
            'report-type2': 'test-file2.json'
          }
        }, context);
      });

      describe('with no time period given', function() {
        it('returns the full path to the file corresponding to the date range', function() {
          var filepath = subject.addReportFileForType('report-type1');

          expect(filepath).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-03_2012-07_test-file1.json');
        });
      });

      describe('with a given time period', function() {
        it('returns the full path to the file corresponding to the time period', function() {
          var filepath = subject.addReportFileForType('report-type2', new TimePeriod({ start: moment('2012-03-01'), end: moment('2012-05-31') }, 'YYYY-MM'));

          expect(filepath).toEqual('/test/output/c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-03_2012-05_test-file2.json');
        });
      });

      describe('with incorrect report type information', function() {
        it('raises an error when adding a report file', function() {
          expect(subject.addReportFileForType.bind(subject, 'report-type3')).toThrow('Invalid report file type: report-type3');
        });
      });
    });
  });

  describe('.createManifest()', function() {
    describe('with a report name', function() {
      beforeEach(function() {
        utils.json.objectToFile = jest.fn().mockResolvedValue();
        subject = new Publisher({
          name: 'test-task',
          reportName: 'test-report',
          reportFile: 'test-file.json'
        }, context);
        subject.addReportFile(new TimePeriod({ start: moment('2012-04-01'), end: moment('2012-05-31') }, 'YYYY-MM'));
        subject.enableDiagram('test-diagram1');
        subject.enableDiagram('test-diagram2');
      });

      it('creates a manifest file', function() {
        return subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.mock.calls[0][1];

          expect(manifest.id).toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
          expect(manifest.reportName).toEqual('test-report');
          expect(manifest.taskName).toEqual('test-task');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('2012-03_2012-07');
          expect(manifest.enabledDiagrams).toEqual(['test-diagram1', 'test-diagram2']);
          expect(manifest.dataFiles).toEqual([
            { fileType: undefined, timePeriod: '2012-04_2012-05', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-04_2012-05_test-file.json'}
          ]);
        });
      });
    });

    describe('without a report name', function() {
      beforeEach(function() {
        utils.json.objectToFile = jest.fn().mockResolvedValue();
        subject = new Publisher({
          name: 'test-task',
          reportFile: 'test-file.json'
        }, context);
        subject.addReportFile(new TimePeriod({ start: moment('2012-04-01'), end: moment('2012-05-31') }, 'YYYY-MM'));
        subject.enableDiagram('test-diagram');
      });

      it('creates a manifest file', function() {
        return subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.mock.calls[0][1];

          expect(manifest.id).toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
          expect(manifest.reportName).toEqual('test-task');
          expect(manifest.taskName).toEqual('test-task');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('2012-03_2012-07');
          expect(manifest.dataFiles).toEqual([
            { fileType: undefined, timePeriod: '2012-04_2012-05', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-04_2012-05_test-file.json'}
          ]);
        });
      });
    });

    describe('with one report file type', function() {
      beforeEach(function() {
        utils.json.objectToFile = jest.fn().mockResolvedValue();
        subject = new Publisher({
          name: 'test-task',
          reportFile: 'test-file.json'
        }, context);
        subject.addReportFile(new TimePeriod({ start: moment('2012-06-01'), end: moment('2012-07-31') }, 'YYYY-MM'));
        subject.addReportFile(new TimePeriod({ start: moment('2012-04-01'), end: moment('2012-05-31') }, 'YYYY-MM'));
        subject.enableDiagram('test-diagram');
      });

      it('creates a manifest file', function() {
        return subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.mock.calls[0][1];

          expect(manifest.id).toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
          expect(manifest.taskName).toEqual('test-task');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('2012-03_2012-07');
          expect(manifest.dataFiles).toEqual([
            { fileType: undefined, timePeriod: '2012-04_2012-05', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-04_2012-05_test-file.json'},
            { fileType: undefined, timePeriod: '2012-06_2012-07', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-06_2012-07_test-file.json'}
          ]);
        });
      });
    });

    describe('with many report file types', function() {
      beforeEach(function() {
        utils.json.objectToFile = jest.fn().mockResolvedValue();
        subject = new Publisher({
          name: 'test-task',
          reportFiles: {
            'report-type1': 'test-file1.json',
            'report-type2': 'test-file2.json'
          }
        }, context);
        subject.addReportFileForType('report-type2', new TimePeriod({ start: moment('2012-06-01'), end: moment('2012-07-31') }, 'YYYY-MM'));
        subject.addReportFileForType('report-type1', new TimePeriod({ start: moment('2012-04-01'), end: moment('2012-05-31') }, 'YYYY-MM'));
        subject.enableDiagram('test-diagram');
      });

      it('creates a manifest file', function() {
        return subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.mock.calls[0][1];

          expect(manifest.id).toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
          expect(manifest.taskName).toEqual('test-task');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('2012-03_2012-07');
          expect(manifest.dataFiles).toEqual([
            { fileType: 'report-type1', timePeriod: '2012-04_2012-05', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-04_2012-05_test-file1.json'},
            { fileType: 'report-type2', timePeriod: '2012-06_2012-07', fileUrl: 'c8c1dcae8f21797ee19a82d7958caf0aba7da1c6/2012-06_2012-07_test-file2.json'}
          ]);
        });
      });
    });

    describe('Failure on manifest creation', function() {
      beforeEach(function() {
        subject = new Publisher({
          name: 'test-task',
          reportFile: 'test-file.json'
        }, context);
      });

      describe('when no report files are added', function() {
        it('returns a rejected promise upon creation', function() {
          return expect(subject.createManifest())
            .rejects
            .toThrow('Failed to create report: no available data files')
            .then(function() {
              expect(mkdirp.sync).not.toHaveBeenCalled();
             });
        });
      });

      describe('when no diagrams are enabled', function() {
        it('returns a rejected promise upon creation', function() {
          subject.addReportFile(new TimePeriod({ start: moment('2012-04-01'), end: moment('2012-05-31') }, 'YYYY-MM'));
          return expect(subject.createManifest()).rejects.toThrow('Failed to create report: no diagrams enabled');
        });
      });
    });

    describe('manifest parameters', function() {
      beforeEach(function() {
        utils.json.objectToFile = jest.fn().mockResolvedValue();
        subject = new Publisher({
          name: 'test-task',
          parameters: [{ name: 'param1' }, { name: 'param2' }],
          reportFile: 'test-file.json'
        }, context);
        subject.addReportFile(new TimePeriod({ start: moment('2012-04-01'), end: moment('2012-05-31') }, 'YYYY-MM'));
        subject.enableDiagram('test-diagram');
      });

      it('exposes the relevant context parameters for the analysis report', function() {
        return subject.createManifest().then(function() {
          var manifest = utils.json.objectToFile.mock.calls[0][1];

          expect(manifest.parameters).toEqual({ param1: 'test_param1' });
        });
      });
    });

    describe('promise arguments', function() {
      beforeEach(function() {
        utils.json.objectToFile = jest.fn().mockResolvedValue();
        subject = new Publisher({
          name: 'test-task',
          reportFile: 'test-file.json'
        }, context);
        subject.addReportFile(new TimePeriod({ start: moment('2012-04-01'), end: moment('2012-05-31') }, 'YYYY-MM'));
        subject.enableDiagram('test-diagram');
      });

      it('exposes the reportId value', function() {
        return expect(subject.createManifest())
          .resolves
          .toEqual('c8c1dcae8f21797ee19a82d7958caf0aba7da1c6');
      });
    });
  });
});
