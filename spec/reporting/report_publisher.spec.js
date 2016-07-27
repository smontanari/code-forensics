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
      this.subject = new ReportPublisher('hotspot-analysis', {
        dateRange: new TimePeriod('start', 'finish'),
        targetFile: 'test/file',
        boundary: 'test_boundary',
        files: taskFiles('/test/tmp', '/test/output')
      });
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('creates the output folder', function() {
      expect(fs.mkdir.calls.mostRecent().args[0]).toEqual('/test/output/f25c4175a548f46f6d1e49489b8406a5e985dac4');
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
        this.subject.addReportFile(new TimePeriod('p1Start', 'p1End'));
        this.subject.addReportFile(new TimePeriod('p2Start', 'p2End'));
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
        expect(manifest.dataFiles).toEqual([
          { timePeriod: 'p1Start_p1End', filename: 'p1Start_p1End_revisions-hotspot-data.json'},
          { timePeriod: 'p2Start_p2End', filename: 'p2Start_p2End_revisions-hotspot-data.json'}
        ]);
      });
    });
  });

  describe('without a valid report type', function() {
    it('raises an error when creating the publisher', function() {
      expect(function() { new ReportPublisher('test-report-type', {}); }).toThrowError('Invalid report type: test-report-type');
    });
  });
});
