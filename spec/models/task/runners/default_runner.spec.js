var DefaultRunner = require('models/task/runners/default_runner');

describe('DefaultRunner', function() {
  var doneCallback;
  beforeEach(function() {
    doneCallback = jest.fn().mockName('done');
  });

  describe('when a task function is defined', function() {
    it('executes the task function passing through the done callback', function() {
      var task = {
        run: jest.fn().mockName('taskFunction')
      };
      new DefaultRunner(task).run(doneCallback);

      expect(task.run).toHaveBeenCalledWith(doneCallback);
    });

    it('returns the output of the task function', function() {
      var output = new DefaultRunner({
        run: function() { return 123; }
      }).run(doneCallback);

      expect(output).toEqual(123);
    });
  });

  describe('when a task function is not defined', function() {
    it('returns undefined and executes the callback', function() {
      var output = new DefaultRunner({}).run(doneCallback);

      expect(output).toBeUndefined();
      expect(doneCallback).toHaveBeenCalled();
    });
  });
});
