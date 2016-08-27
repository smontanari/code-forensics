var gulp = require('gulp');
var TaskDefinitions = require_src('runtime/task_definitions');

describe('TaskDefinitions', function() {
  var gulpTask;

  beforeEach(function() {
    gulpTask = spyOn(gulp, 'task');
    this.subject = new TaskDefinitions();
  });

  describe('adding a definition with a description', function() {
    beforeEach(function() {
      this.subject.add('test-task', 'test task description', 'test-arg1', 'test-arg2');
    });

    it('adds a task with gulp', function() {
      expect(gulpTask).toHaveBeenCalledWith('test-task', 'test-arg1', 'test-arg2');
    });

    it('associates the description to the task', function() {
      expect(this.subject.describe('test-task')).toEqual('test task description');
    });
  });

  describe('adding a definition without a description', function() {
    beforeEach(function() {
      this.subject.add('test-task', 123, 'test-arg');
    });

    it('adds a task with gulp', function() {
      expect(gulpTask).toHaveBeenCalledWith('test-task', 123, 'test-arg');
    });

    it('associates a default description to the task', function() {
      expect(this.subject.describe('test-task')).toEqual('No description available');
    });
  });

  describe('adding a duplicate task', function() {
    beforeEach(function() {
      this.subject.add('test-task', 123, 'test-arg');
    });

    it('throws an error', function() {
      var dup = function() { this.subject.add('test-task', 456, 'test-arg'); };
      expect(dup.bind(this)).toThrowError();
    });
  });

  describe('Finding existing tasks', function() {
    beforeEach(function() {
      this.subject.add('test-task1', 123, 'test-arg1');
      this.subject.add('test-task2', 456, 'test-arg2');
    });

    it('returns true for a defined task', function() {
      expect(this.subject.isTaskDefined('test-task1')).toBeTruthy();
    });

    it('returns false for a non defined task', function() {
      expect(this.subject.isTaskDefined('test-task3')).toBeFalsy();
    });
  });
});
