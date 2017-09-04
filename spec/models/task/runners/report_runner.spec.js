var stream   = require('stream'),
    Bluebird = require('bluebird');

var ReportRunner = require_src('models/task/runners/report_runner'),
    reporting    = require_src('reporting');

describe('ReportRunner', function() {
  var mockPublisher;
  beforeEach(function() {
    mockPublisher = jasmine.createSpyObj('Publisher', ['createManifest']);
    spyOn(reporting, 'Publisher').and.returnValue(mockPublisher);
  });

  it('executes the task function spreading the array of parameters preceeded by the report publisher', function() {
    var task = {
      taskFunction: jasmine.createSpy('taskFunction')
    };
    new ReportRunner(task).run(['test_param1', 'test_param2']);

    expect(task.taskFunction).toHaveBeenCalledWith(mockPublisher, 'test_param1', 'test_param2');
  });

  describe('when the output of the task function is a stream', function() {
    it('creates the manifest after the stream is ended', function(done) {
      var output = new stream.PassThrough();

      new ReportRunner({
        taskFunction: function() { return output; }
      }).run('test_param1', 'test_param2').then(function() {
        expect(mockPublisher.createManifest).toHaveBeenCalledWith(undefined);
        done();
      });

      output.push('123'); //TODO: mock utils.streamToPromise
      output.end();
    });
  });

  describe('when the output of the task function is a simple value', function() {
    it('creates the manifest after the task function is completed', function(done) {
      new ReportRunner({
        taskFunction: function() { return 123; }
      }).run('test_param1', 'test_param2').then(function() {
        expect(mockPublisher.createManifest).toHaveBeenCalledWith(123);
        done();
      });
    });
  });

  describe('when the output of the task function is a promise', function() {
    it('creates the manifest after the task promise is fulfilled', function(done) {
      new ReportRunner({
        taskFunction: function() { return Bluebird.resolve(123); }
      }).run('test_param1', 'test_param2').then(function() {
        expect(mockPublisher.createManifest).toHaveBeenCalledWith(123);
        done();
      });
    });

    it('does not create the manifest if the task promise is rejected', function(done) {
      new ReportRunner({
        taskFunction: function() { return Bluebird.reject(new Error()); }
      }).run('test_param1', 'test_param2').then(function() {
        expect(mockPublisher.createManifest).not.toHaveBeenCalledWith();
        done();
      });
    });
  });

  describe('when a task function is not defined', function() {
    it('returns without creating a manifest', function() {
      var output = new ReportRunner({}).run('test_param1', 'test_param2');

      expect(output).toBeUndefined();
      expect(mockPublisher.createManifest).not.toHaveBeenCalledWith();
    });
  });

  describe('when the task function throws an error', function() {
    it('returns without creating a manifest', function() {
      var output = new ReportRunner({
        taskFunction: function() { throw new Error('something is wrong'); }
      }).run('test_param1', 'test_param2');

      expect(output).toBeUndefined();
      expect(mockPublisher.createManifest).not.toHaveBeenCalledWith();
    });
  });
});
