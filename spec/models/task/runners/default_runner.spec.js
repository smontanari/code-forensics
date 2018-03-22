var DefaultRunner = require_src('models/task/runners/default_runner');

describe('DefaultRunner', function() {
  beforeEach(function() {
    this.doneCallback = jasmine.createSpy('done');
  });

  describe('when a task function is defined', function() {
    it('executes the task function passing through the done callback', function() {
      var task = {
        run: jasmine.createSpy('taskFunction')
      };
      new DefaultRunner(task).run(this.doneCallback);

      expect(task.run).toHaveBeenCalledWith(this.doneCallback);
    });

    it('returns the output of the task function', function() {
      var output = new DefaultRunner({
        run: function() { return 123; }
      }).run(this.doneCallback);

      expect(output).toEqual(123);
    });
  });

  describe('when a task function is not defined', function() {
    it('returns undefined and executes the callback', function() {
      var output = new DefaultRunner({}).run(this.doneCallback);

      expect(output).toBeUndefined();
      expect(this.doneCallback).toHaveBeenCalledWith();
    });
  });
});
