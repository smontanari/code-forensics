var stream = require('stream');

var ReportRunner = require_src('models/task/report_runner'),
    reporting     = require_src('reporting');

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
    it('returns a promise fulfilled after the stream is ended', function(done) {
      var output = new stream.PassThrough();

      new ReportRunner({
        taskFunction: function() { return output; }
      }).run('test_param1', 'test_param2').then(function() {
        expect(mockPublisher.createManifest).toHaveBeenCalled();
        done();
      });

      output.push('123');
      output.end();
    });
  });

  describe('when the output of the task function is not a stream', function() {
    it('returns a promise fulfilled after the task function is completed', function(done) {
      new ReportRunner({
        taskFunction: function() { return 123; }
      }).run('test_param1', 'test_param2').then(function() {
        expect(mockPublisher.createManifest).toHaveBeenCalled();
        done();
      });
    });
  });
});
