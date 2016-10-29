var gulp = require('gulp');
var TaskDefinitions = require_src('models/task_definitions');

describe('TaskDefinitions', function() {
  var gulpTask;

  beforeEach(function() {
    gulpTask = spyOn(gulp, 'task');
    this.subject = new TaskDefinitions();
  });

  describe('Adding task definitions', function() {
    describe('adding a definition with task information', function() {
      it('adds a task with gulp', function() {
        this.subject.add('test-task', {
          description: 'test task description',
          parameters: [{ name: 'testParam', required: true }]
        }, 'test-arg1', 'test-arg2');

        expect(gulpTask).toHaveBeenCalledWith('test-task', 'test-arg1', 'test-arg2');
      });
    });

    describe('adding a definition without task information', function() {
      it('adds a task with gulp', function() {
        this.subject.add('test-task', 'test-arg1', 'test-arg2');

        expect(gulpTask).toHaveBeenCalledWith('test-task', 'test-arg1', 'test-arg2');
      });
    });

    describe('adding a duplicate definition', function() {
      beforeEach(function() {
        this.subject.add('test-task', 123, 'test-arg');
      });

      it('throws an error', function() {
        var dup = function() { this.subject.add('test-task', 456, 'test-arg'); };
        expect(dup.bind(this)).toThrowError('Task name test-task already defined');
      });
    });
  });

  describe('Existing tasks', function() {
    beforeEach(function() {
      this.subject.add('test-task1', {
        description: 'test task description',
        parameters: [{ name: 'testParam', required: true }]
      }, 'test-arg1');
      this.subject.add('test-task2', 456, 'test-arg2');
    });

    it('returns all the top level tasks (with a description)', function() {
      var tasks = this.subject.topLevelTasks();
      expect(tasks.length).toEqual(1);
      expect(tasks[0].name).toEqual('test-task1');
    });

    it('returns the task ', function() {
      var task = this.subject.getTask('test-task1');
      expect(task.name).toEqual('test-task1');
      expect(task.description).toEqual('test task description');
      expect(task.usage).toEqual('gulp test-task1 --testParam <testParam> [--dateFrom <dateFrom> --dateTo <dateTo>]');
    });

    it('returns true for a defined task', function() {
      expect(this.subject.isTaskDefined('test-task1')).toBeTruthy();
    });

    it('returns false for a non defined task', function() {
      expect(this.subject.isTaskDefined('test-task3')).toBeFalsy();
    });
  });
});
