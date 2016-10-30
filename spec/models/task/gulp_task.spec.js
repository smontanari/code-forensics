var Task = require_src('models/task/gulp_task');

describe('Task', function() {
  var assertTask = function(task, description, dependencies, fn, isTopLevel, usage) {
    expect(task.name).toEqual('test-task');
    expect(task.description).toEqual(description);
    expect(task.isTopLevel).toEqual(isTopLevel);
    expect(task.usage).toEqual(usage);
    expect(task.dependencies).toEqual(dependencies);
    expect(task.taskFunction).toEqual(fn);
  };

  describe('with a description and no parameters', function() {
    it('returns a Task with the given description', function() {
      var task = new Task('test-task', { description: 'test task description' }, ['test-dep1', 'test-dep2'], 'testFunction');

      assertTask(task, 'test task description', ['test-dep1', 'test-dep2'], 'testFunction', true, 'gulp test-task');
    });
  });

  describe('with no description and no parameters', function() {
    it('returns a Task with the default description', function() {
      var task = new Task('test-task', ['test-dep1', 'test-dep2'], 'testFunction');

      assertTask(task, 'No description available', ['test-dep1', 'test-dep2'], 'testFunction', false, 'gulp test-task');
    });
  });

  describe('with description and parameters', function() {
    it('returns a Task with the usage information', function() {
      var task = new Task('test-task', {
        description: 'test task description',
        parameters: [{ name: 'param1', required: true }, { name: 'param2' }, { name: 'param3' }]
      }, ['test-dep1', 'test-dep2'], 'testFunction');

      assertTask(task, 'test task description', ['test-dep1', 'test-dep2'], 'testFunction', true, 'gulp test-task --param1 <param1> [--param2 <param2> --param3 <param3>]');
    });
  });

  describe('with parameters and no description', function() {
    it('returns a Task with the usage information', function() {
      var task = new Task('test-task', {
        parameters: [{ name: 'param1', required: true }, { name: 'param2' }, { name: 'param3' }]
      }, ['test-dep1', 'test-dep2'], 'testFunction');

      assertTask(task, 'No description available', ['test-dep1', 'test-dep2'], 'testFunction', false, 'gulp test-task --param1 <param1> [--param2 <param2> --param3 <param3>]');
    });
  });

  describe('with additional attributes', function() {
    it('returns a Task with the given attributes', function() {
      var task = new Task('test-task', {
        testProperty: 123
      }, ['test-dep1', 'test-dep2'], 'testFunction');

      expect(task.testProperty).toEqual(123);
    });
  });

  describe('with no dependencies specified', function() {
    it('returns a task with an empty array of dependencies', function() {
      var task = new Task('test-task', 'testFunction');

      assertTask(task, 'No description available', [], 'testFunction', false, 'gulp test-task');
    });
  });

  describe('with no function specified', function() {
    it('returns a task with no task function to execute', function() {
      var task = new Task('test-task', ['test-dep1']);

      assertTask(task, 'No description available', ['test-dep1'], undefined, false, 'gulp test-task');
    });
  });

  describe('Parameters validation', function() {
    beforeEach(function() {
      this.task = new Task('test-task', {
        parameters: [{ name: 'param1', required: true }, { name: 'param2' }, { name: 'param3' }]
      }, 'testFunction');
    });

    it('does not throw any error if any required parameter is present', function() {
      this.task.validateParameters({ param1: 123, param3: 'zxc' });
    });

    it('throws an error if any required parameter is undefined', function() {
      expect(
        this.task.validateParameters.bind(this.task, { param2: 456 })
      ).toThrowError('Required parameter missing: param1');
    });

    it('throws an error if any required parameter is null', function() {
      expect(
        this.task.validateParameters.bind(this.task, { param1: null, param2: 456 })
      ).toThrowError('Required parameter missing: param1');
    });
  });
});
