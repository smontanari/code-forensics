var fs = require('fs'),
    _  = require('lodash'),
    Q  = require('q');

var Publisher  = require_src('reporting/publisher'),
    utils      = require_src('utils'),
    TimePeriod = require_src('models').TimePeriod;

describe('Publisher', function() {
  describe('with a valid report type', function() {
    beforeEach(function() {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2013-10-22T13:00:00.000Z'));
      spyOn(fs, 'mkdir');
      this.context = {
        dateRange: new TimePeriod('start', 'finish'),
        outputDir: '/test/output',
        parameters: {
          targetFile: 'test/file',
          boundary: 'test_boundary',
          frequency: 'test_frequency',
          maxCoupledFiles: 3
        }
      };
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('creates the output folder', function() {
      this.subject = new Publisher('hotspot-analysis', this.context);
      expect(fs.mkdir.calls.mostRecent().args[0]).toEqual('/test/output/f25c4175a548f46f6d1e49489b8406a5e985dac4');
    });

    describe('.addReportFile()', function() {
      describe('with one report file type', function() {
        beforeEach(function() {
          this.subject = new Publisher('hotspot-analysis', this.context);
        });

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

      describe('with many report file types', function() {
        beforeEach(function() {
          this.subject = new Publisher('system-evolution', this.context);
        });

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
    });

    describe('.createManifest()', function() {
      describe('with one report file type', function() {
        beforeEach(function() {
          spyOn(utils.json, 'objectToFile').and.returnValue(Q());
          this.subject = new Publisher('hotspot-analysis', this.context);
          this.subject.addReportFile(new TimePeriod('p2Start', 'p2End'));
          this.subject.addReportFile(new TimePeriod('p1Start', 'p1End'));
        });

        it('creates a manifest file', function(done) {
          this.subject.createManifest().then(function() {
            var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
            expect(manifest.id).toEqual('f25c4175a548f46f6d1e49489b8406a5e985dac4');
            expect(manifest.reportType).toEqual('hotspot-analysis');
            expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
            expect(manifest.dateRange).toEqual('start_finish');
            expect(manifest.dataFiles).toEqual([
              { fileType: undefined, timePeriod: 'p1Start_p1End', fileUrl: 'f25c4175a548f46f6d1e49489b8406a5e985dac4/p1Start_p1End_revisions-hotspot-data.json'},
              { fileType: undefined, timePeriod: 'p2Start_p2End', fileUrl: 'f25c4175a548f46f6d1e49489b8406a5e985dac4/p2Start_p2End_revisions-hotspot-data.json'}
            ]);

            done();
          });
        });
      });

      describe('with many report file types', function() {
        beforeEach(function() {
          spyOn(utils.json, 'objectToFile').and.returnValue(Q());
          this.subject = new Publisher('system-evolution', this.context);
          this.subject.addReportFileForType('coupling-trend', new TimePeriod('p2Start', 'p2End'));
          this.subject.addReportFileForType('revisions-trend', new TimePeriod('p1Start', 'p1End'));
        });

        it('creates a manifest file', function(done) {
          this.subject.createManifest().then(function() {
            var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
            expect(manifest.id).toEqual('21833855c56ebd0dff4d2b42aa2bd9aafe252b08');
            expect(manifest.reportType).toEqual('system-evolution');
            expect(manifest.time).toEqual('2013-10-22T13:00:00.000Z');
            expect(manifest.dateRange).toEqual('start_finish');
            expect(manifest.dataFiles).toEqual([
              { fileType: 'revisions-trend', timePeriod: 'p1Start_p1End', fileUrl: '21833855c56ebd0dff4d2b42aa2bd9aafe252b08/p1Start_p1End_system-revisions-data.json'},
              { fileType: 'coupling-trend', timePeriod: 'p2Start_p2End', fileUrl: '21833855c56ebd0dff4d2b42aa2bd9aafe252b08/p2Start_p2End_system-coupling-data.json'}
            ]);

            done();
          });
        });
      });

      describe('manifest parameters', function() {
        var assertManifestParameters = function(reportType, paramNames) {
          it('exposes the relevant parameters for the "' + reportType + '" analysis report', function(done) {
            var expectedParameters = _.pick(this.context.parameters, paramNames);
            new Publisher(reportType, this.context).createManifest().then(function() {
              var manifest = utils.json.objectToFile.calls.mostRecent().args[1];
              expect(manifest.parameters).toEqual(expectedParameters);
              done();
            });
          });
        };

        beforeEach(function() {
          spyOn(utils.json, 'objectToFile').and.returnValue(Q());
        });

        assertManifestParameters('sum-of-coupling');
        assertManifestParameters('hotspot-analysis');
        assertManifestParameters('developer-effort');
        assertManifestParameters('temporal-coupling', ['targetFile', 'frequency']);
        assertManifestParameters('complexity-trend', 'targetFile');
        assertManifestParameters('commit-messages', 'frequency');
        assertManifestParameters('system-evolution', ['frequency', 'boundary']);
        assertManifestParameters('authors-coupling', ['maxCoupledFiles']);
      });
    });
  });

  describe('without a valid report type', function() {
    it('raises an error when creating the publisher', function() {
      expect(function() { new Publisher('test-report-type', {}); }).toThrowError('Invalid report type: test-report-type');
    });
  });
});
