var DefaultRunner = require_src('models/task/runners/default_runner');

describe('DefaultRunner', function() {
  describe('when a task function is defined', function() {
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

  describe('when a task function is not defined', function() {
    it('returns undefined', function() {
      var output = new DefaultRunner({}).run('test_param1', 'test_param2');

      expect(output).toBeUndefined();
    });
  });
});
