var gulp = require('gulp');

var TaskDefinitions = require_src('models/task/task_definitions');

describe('TaskDefinitions', function() {
  var gulpTask, gulpFunction;

  beforeEach(function() {
    gulpTask = spyOn(gulp, 'task');
    gulpTask.and.callFake(function(taskName, deps, fn) { gulpFunction = fn; });
    this.taskFunction = jasmine.createSpy('taskFn').and.returnValue('test-output');
  });

  describe('Adding task definitions', function() {
    beforeEach(function() {
      this.subject = new TaskDefinitions({});
    });

    describe('adding a definition with task information', function() {
      beforeEach(function() {
        this.subject.add('test-task', {
          description: 'test task description',
          parameters: [{ name: 'testParam' }]
        }, ['task-dependencies'], this.taskFunction);
      });

      it('adds a task with gulp', function() {
        expect(gulpTask).toHaveBeenCalledWith('test-task', ['task-dependencies'], jasmine.any(Function));
      });

      it('executes the task function through gulp', function() {
        expect(gulpFunction('gulp-param1', 'gulp-param2')).toEqual('test-output');
        expect(this.taskFunction).toHaveBeenCalledWith('gulp-param1', 'gulp-param2');
      });
    });

    describe('adding a definition without task information', function() {
      beforeEach(function() {
        this.subject.add('test-task', ['task-dependencies'], this.taskFunction);
      });

      it('adds a task with gulp', function() {
        expect(gulpTask).toHaveBeenCalledWith('test-task', ['task-dependencies'], jasmine.any(Function));
      });

      it('executes the task function through gulp', function() {
        expect(gulpFunction('gulp-param1', 'gulp-param2')).toEqual('test-output');
        expect(this.taskFunction).toHaveBeenCalledWith('gulp-param1', 'gulp-param2');
      });
    });

    describe('adding a duplicate definition', function() {
      beforeEach(function() {
        this.subject.add('test-task', ['task-dependencies'], this.taskFunction);
      });

      it('throws an error', function() {
        var dup = function() { this.subject.add('test-task', ['task-dependencies']); };

        expect(dup.bind(this)).toThrowError('Task name test-task already defined');
      });
    });
  });


  describe('Task parameters validation', function() {
    beforeEach(function() {
      this.subject = new TaskDefinitions({
        parameters: { testParam1: 123 }
      });
    });

    it('it invokes the task function when all required parameters are present', function() {
      this.subject.add('test-task', {
        description: 'test task description',
        parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
      }, ['task-dependencies'], this.taskFunction);

      gulpFunction();
      expect(this.taskFunction).toHaveBeenCalled();
    });

    it('it throws an error if any required parameter is not present', function() {
      this.subject.add('test-task', {
        description: 'test task description',
        parameters: [{ name: 'testParam2', required: true }]
      }, ['task-dependencies'], this.taskFunction);

      expect(gulpFunction).toThrowError();
    });
  });

  describe('Existing tasks', function() {
    beforeEach(function() {
      this.subject = new TaskDefinitions({ parameters: { testParam: 123 } });
      this.subject.add('test-task1', {
        description: 'test task description',
        parameters: [{ name: 'testParam', required: true }]
      }, this.taskFunction);
      this.subject.add('test-task2', ['task-dependencies'], this.taskFunction);
    });

    it('returns all the top level tasks (with a description)', function() {
      var tasks = this.subject.topLevelTasks();
      expect(tasks.length).toEqual(1);
      expect(tasks[0].name).toEqual('test-task1');
    });

    it('returns the task', function() {
      var task = this.subject.getTask('test-task1');
      expect(task.name).toEqual('test-task1');
      expect(task.description).toEqual('test task description');
      expect(task.usage).toEqual('gulp test-task1 --testParam <testParam>');
    });

    it('returns true for a defined task', function() {
      expect(this.subject.isTaskDefined('test-task1')).toBeTruthy();
    });

    it('returns false for a non defined task', function() {
      expect(this.subject.isTaskDefined('test-task3')).toBeFalsy();
    });
  });
});
