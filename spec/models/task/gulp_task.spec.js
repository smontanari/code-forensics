/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "assertTask"] }] */
var Task              = require('models/task/gulp_task'),
    CFValidationError = require('runtime/errors').CFValidationError;

describe('Task', function() {
  var task;
  var assertTask = function(task, description, dependency, fn, usage) {
    expect(task.name).toEqual('test-task');
    expect(task.description).toEqual(description);
    expect(task.usage).toEqual(usage);
    expect(task.dependency).toEqual(dependency);
    expect(task.run).toEqual(fn);
  };

  describe('with a description and no parameters', function() {
    it('returns a Task with the given description', function() {
      task = new Task('test-task', { description: 'test task description', run: 'testFunction' }, 'test-dependency');

      assertTask(task, 'test task description', 'test-dependency', 'testFunction', 'gulp test-task');
    });
  });

  describe('with no description and no parameters', function() {
    it('returns a Task with the default description', function() {
      task = new Task('test-task', { run: 'testFunction' }, 'test-dependency');

      assertTask(task, 'No description available', 'test-dependency', 'testFunction', 'gulp test-task');
    });
  });

  describe('with description and parameters', function() {
    it('returns a Task with the usage information', function() {
      task = new Task('test-task', {
        description: 'test task description',
        run: 'testFunction',
        parameters: [{ name: 'param1', required: true }, { name: 'param2' }, { name: 'param3' }]
      }, 'test-dependency');

      assertTask(task, 'test task description', 'test-dependency', 'testFunction', 'gulp test-task --param1=<param1> [--param2=<param2>] [--param3=<param3>]');
    });
  });

  describe('with parameters and no description', function() {
    it('returns a Task with the usage information', function() {
      task = new Task('test-task', {
        run: 'testFunction',
        parameters: [
          { name: 'param1', required: true },
          { name: 'param2' },
          { name: 'param3', isFlag: true }
        ]
      }, 'test-dependency');

      assertTask(task,
        'No description available', 'test-dependency', 'testFunction',
        'gulp test-task --param1=<param1> [--param2=<param2>] [--param3]'
      );
    });
  });

  describe('with additional attributes', function() {
    it('returns a Task with the given attributes', function() {
      task = new Task('test-task', {
        testProperty: 123,
        run: 'testFunction'
      }, 'test-dependency');

      expect(task.testProperty).toEqual(123);
    });
  });

  describe('with no dependencies specified', function() {
    it('returns a task with an empty array of dependencies', function() {
      task = new Task('test-task', { run: 'testFunction' });

      assertTask(task, 'No description available', undefined, 'testFunction', 'gulp test-task');
    });
  });

  describe('Parameters validation', function() {
    beforeEach(function() {
      task = new Task('test-task', {
        taskFunction: 'testFunction',
        parameters: [{ name: 'param1', required: true }, { name: 'param2' }, { name: 'param3' }]
      });
    });

    it('does not throw any error if all required parameter are present', function() {
      expect(
        function() { task.validateParameters({ param1: 123, param3: 'zxc' }); }
      ).not.toThrow();
    });

    it('throws an error if any required parameter is undefined', function() {
      expect(
        task.validateParameters.bind(task, { param2: 456 })
      ).toThrow(CFValidationError, 'Required parameter missing: param1');
    });

    it('throws an error if any required parameter is null', function() {
      expect(
        task.validateParameters.bind(task, { param1: null, param2: 456 })
      ).toThrow(CFValidationError, 'Required parameter missing: param1');
    });
  });
});
