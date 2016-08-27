var stream = require('stream'),
    Q      = require('q');

var ReportHelper = require_src('tasks/helpers/report_helper'),
    reporting = require_src('reporting');

describe('reportHelper', function() {
  describe('.publish()', function() {
    var mockPublisher;

    beforeEach(function() {
      mockPublisher = jasmine.createSpyObj('publisher', ['publish', 'createManifest']);
      spyOn(reporting, 'Publisher').and.returnValue(mockPublisher);

      this.subject = new ReportHelper('test_context');
    });

    describe('when generating a report stream', function() {
      it('creates the report manifest when the stream is closed', function(done) {
        var testStream = new stream.PassThrough();

        this.subject.publish('test-report-type', function() {
          return testStream;
        }).then(function() {
          expect(mockPublisher.createManifest).toHaveBeenCalled();
          done();
        });
        expect(reporting.Publisher).toHaveBeenCalledWith('test-report-type', 'test_context');
        expect(mockPublisher.createManifest).not.toHaveBeenCalled();

        testStream.end();
      });
    });

    describe('when generating a report promise', function() {
      it('creates the report manifest when the promise is fulfilled', function(done) {
        var deferred = Q.defer();

        this.subject.publish('test-report-type', function() {
          return deferred.promise;
        }).then(function() {
          expect(mockPublisher.createManifest).toHaveBeenCalled();
          done();
        });
        expect(reporting.Publisher).toHaveBeenCalledWith('test-report-type', 'test_context');
        expect(mockPublisher.createManifest).not.toHaveBeenCalled();
        deferred.resolve();
      });
    });
  });
});
