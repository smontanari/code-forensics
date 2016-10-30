var DefaultRunner = require_src('models/task/default_runner');

describe('DefaultRunner', function() {
  it('executes the task function spreading the array of parameters', function() {
    var task = {
      taskFunction: jasmine.createSpy('taskFunction')
    };
    new DefaultRunner(task).run(['test_param1', 'test_param2']);

    expect(task.taskFunction).toHaveBeenCalledWith('test_param1', 'test_param2');
  });

  it('returns the output of the task function', function() {
    var output = new DefaultRunner({
      taskFunction: function() { return 123; }
    }).run('test_param1', 'test_param2');

    expect(output).toEqual(123);
  });
});
