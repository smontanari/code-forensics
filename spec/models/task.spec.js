var Task = require_src('models/task');

describe('Task', function() {
  var assertTask = function(task, description, isTopLevel, usage) {
    expect(task.name).toEqual('test-task');
    expect(task.description).toEqual(description);
    expect(task.isTopLevel).toEqual(isTopLevel);
    expect(task.usage).toEqual(usage);
    expect(task.gulpParameters).toEqual(['gulp-param1', 'gulp-param2']);
  };

  describe('with a description and no parameters', function() {
    it('returns a Task with the given description', function() {
      var task = new Task('test-task', { description: 'test task description' }, 'gulp-param1', 'gulp-param2');

      assertTask(task, 'test task description', true, 'gulp test-task [--dateFrom <dateFrom> --dateTo <dateTo>]');
    });
  });

  describe('with no description and no parameters', function() {
    it('returns a Task with the default description', function() {
      var task = new Task('test-task', 'gulp-param1', 'gulp-param2');

      assertTask(task, 'No description available', false, 'gulp test-task [--dateFrom <dateFrom> --dateTo <dateTo>]');
    });
  });

  describe('with description and parameters', function() {
    it('returns a Task with the usage information', function() {
      var task = new Task('test-task', {
        description: 'test task description',
        parameters: [{ name: 'param1', required: true }, { name: 'param2' }, { name: 'param3' }]
      }, 'gulp-param1', 'gulp-param2');

      assertTask(task, 'test task description', true, 'gulp test-task --param1 <param1> [--dateFrom <dateFrom> --dateTo <dateTo> --param2 <param2> --param3 <param3>]');
    });
  });

  describe('with parameters and no description', function() {
    it('returns a Task with the usage information', function() {
      var task = new Task('test-task', {
        parameters: [{ name: 'param1', required: true }, { name: 'param2' }, { name: 'param3' }]
      }, 'gulp-param1', 'gulp-param2');

      assertTask(task, 'No description available', false, 'gulp test-task --param1 <param1> [--dateFrom <dateFrom> --dateTo <dateTo> --param2 <param2> --param3 <param3>]');
    });
  });
});
