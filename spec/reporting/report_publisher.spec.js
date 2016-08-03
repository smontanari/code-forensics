var fs              = require('fs'),
    ReportPublisher = require_src('reporting/report_publisher'),
    utils           = require_src('utils'),
    taskFiles       = require_src('runtime/task_files'),
    TimePeriod      = require_src('time_interval/time_period');

describe('ReportPublisher', function() {
  describe('with a valid report type', function() {
    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2013, 9, 23));
      spyOn(fs, 'mkdir');
      this.context = {
        dateRange: new TimePeriod('start', 'finish'),
        targetFile: 'test/file',
        boundaryDefinition: { name: 'test_boundary' },
        frequency: 'test-frequency',
        files: taskFiles('/test/tmp', '/test/output')
      };
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('creates the output folder', function() {
      this.subject = new ReportPublisher('hotspot-analysis', this.context);
      expect(fs.mkdir.calls.mostRecent().args[0]).toEqual('/test/output/f25c4175a548f46f6d1e49489b8406a5e985dac4');
    });

    describe('with one report file type', function() {
      beforeEach(function() {
        this.subject = new ReportPublisher('hotspot-analysis', this.context);
      });

      describe('.addReportFile()', function() {
        describe('with no time period given', function() {
          it('returns the full path to the file corresponding to the date range', function() {
            var filepath = this.subject.addReportFile();

            expect(filepath).toEqual('/test/output/f25c4175a548f46f6d1e49489b8406a5e985dac4/start_finish_revisions-hotspot-data.json');
          });
        });

        describe('with a given time period', function() {
          it('returns the full path to the file corresponding to the time period', function() {
            var filepath = this.subject.addReportFile(new TimePeriod('begin', 'end'));

            expect(filepath).toEqual('/test/output/f25c4175a548f46f6d1e49489b8406a5e985dac4/begin_end_revisions-hotspot-data.json');
          });
        });
      });

      describe('.createManifest()', function() {
        beforeEach(function() {
          spyOn(utils.json, 'objectToFile');
          spyOn(utils.messages, 'logReportUrl');
          this.subject.addReportFile(new TimePeriod('p2Start', 'p2End'));
          this.subject.addReportFile(new TimePeriod('p1Start', 'p1End'));
        });

        it('creates a manifest file', function() {
          this.subject.createManifest();

          var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
          expect(manifest.id).toEqual('f25c4175a548f46f6d1e49489b8406a5e985dac4');
          expect(manifest.reportType).toEqual('hotspot-analysis');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('start_finish');
          expect(manifest.targetFile).toEqual('test/file');
          expect(manifest.boundary).toEqual('test_boundary');
          expect(manifest.frequency).toEqual('test-frequency');
          expect(manifest.dataFiles).toEqual([
            { fileType: undefined, timePeriod: 'p1Start_p1End', fileUrl: 'f25c4175a548f46f6d1e49489b8406a5e985dac4/p1Start_p1End_revisions-hotspot-data.json'},
            { fileType: undefined, timePeriod: 'p2Start_p2End', fileUrl: 'f25c4175a548f46f6d1e49489b8406a5e985dac4/p2Start_p2End_revisions-hotspot-data.json'}
          ]);
        });
      });
    });

    describe('with many report file types', function() {
      beforeEach(function() {
        this.subject = new ReportPublisher('system-evolution', this.context);
      });

      describe('.addReportFile()', function() {
        describe('with no time period given', function() {
          it('returns the full path to the file corresponding to the date range', function() {
            var filepath = this.subject.addReportFileForType('coupling-trend');

            expect(filepath).toEqual('/test/output/21833855c56ebd0dff4d2b42aa2bd9aafe252b08/start_finish_system-coupling-data.json');
          });
        });

        describe('with a given time period', function() {
          it('returns the full path to the file corresponding to the time period', function() {
            var filepath = this.subject.addReportFileForType('revisions-trend', new TimePeriod('begin', 'end'));

            expect(filepath).toEqual('/test/output/21833855c56ebd0dff4d2b42aa2bd9aafe252b08/begin_end_system-revisions-data.json');
          });
        });
      });

      describe('.createManifest()', function() {
        beforeEach(function() {
          spyOn(utils.json, 'objectToFile');
          spyOn(utils.messages, 'logReportUrl');
          this.subject.addReportFileForType('coupling-trend', new TimePeriod('p2Start', 'p2End'));
          this.subject.addReportFileForType('revisions-trend', new TimePeriod('p1Start', 'p1End'));
        });

        it('creates a manifest file', function() {
          this.subject.createManifest();

          var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
          expect(manifest.id).toEqual('21833855c56ebd0dff4d2b42aa2bd9aafe252b08');
          expect(manifest.reportType).toEqual('system-evolution');
          expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
          expect(manifest.dateRange).toEqual('start_finish');
          expect(manifest.targetFile).toEqual('test/file');
          expect(manifest.boundary).toEqual('test_boundary');
          expect(manifest.frequency).toEqual('test-frequency');
          expect(manifest.dataFiles).toEqual([
            { fileType: 'revisions-trend', timePeriod: 'p1Start_p1End', fileUrl: '21833855c56ebd0dff4d2b42aa2bd9aafe252b08/p1Start_p1End_system-revisions-data.json'},
            { fileType: 'coupling-trend', timePeriod: 'p2Start_p2End', fileUrl: '21833855c56ebd0dff4d2b42aa2bd9aafe252b08/p2Start_p2End_system-coupling-data.json'}
          ]);
        });
      });
    });
  });

  describe('without a valid report type', function() {
    it('raises an error when creating the publisher', function() {
      expect(function() { new ReportPublisher('test-report-type', {}); }).toThrowError('Invalid report type: test-report-type');
    });
  });
});
