var gulp = require('gulp');

var TaskDefinitions   = require_src('models/task/task_definitions'),
    CFValidationError = require_src('models/validation_error'),
    runners           = require_src('models/task/runners');

describe('TaskDefinitions', function() {
  var gulpTask, gulpFunction, mockRunners;

  beforeEach(function() {
    mockRunners = {
      default: { run: jasmine.createSpy().and.returnValue('default-output') },
      report: { run: jasmine.createSpy().and.returnValue('report-output') }
    };

    gulpTask = spyOn(gulp, 'task');
    gulpTask.and.callFake(function(taskName, deps, fn) { gulpFunction = fn; });
    spyOn(runners, 'Default').and.returnValue(mockRunners.default);
    spyOn(runners, 'Report').and.returnValue(mockRunners.report);
    this.taskFunction = jasmine.createSpy('taskFn').and.returnValue('test-output');
  });

  describe('Adding task definitions', function() {
    beforeEach(function() {
      this.subject = new TaskDefinitions({});
    });

    var assertTaskExecution = function(runner) {
      it('adds a task with gulp', function() {
        expect(gulpTask).toHaveBeenCalledWith('test-task', ['task-dependencies'], jasmine.any(Function));
      });

      it('executes the task function through the ' + runner + ' runner', function() {
        expect(gulpFunction('gulp-param1', 'gulp-param2')).toEqual(runner + '-output');
        expect(mockRunners[runner].run).toHaveBeenCalledWith(['gulp-param1', 'gulp-param2']);
      });
    };

    describe('adding a task with information', function() {
      beforeEach(function() {
        this.subject.addTask('test-task', {
          description: 'test task description',
          parameters: [{ name: 'testParam' }]
        }, ['task-dependencies'], this.taskFunction);
      });

      assertTaskExecution('default');
    });

    describe('adding an analysis task with information', function() {
      beforeEach(function() {
        this.subject.addAnalysisTask('test-task', {
          description: 'test task description',
          parameters: [{ name: 'testParam' }]
        }, ['task-dependencies'], this.taskFunction);
      });

      assertTaskExecution('report');
    });

    describe('adding a task without information', function() {
      beforeEach(function() {
        this.subject.addTask('test-task', ['task-dependencies'], this.taskFunction);
      });

      assertTaskExecution('default');
    });

    describe('adding an analysis task without information', function() {
      beforeEach(function() {
        this.subject.addAnalysisTask('test-task', ['task-dependencies'], this.taskFunction);
      });

      assertTaskExecution('report');
    });

    describe('adding a duplicate task definition', function() {
      beforeEach(function() {
        this.subject.addTask('test-task', ['task-dependencies'], this.taskFunction);
        this.subject.addAnalysisTask('test-analysis-task', ['task-dependencies'], this.taskFunction);
      });

      it('throws an error', function() {
        var dup = function() { this.subject.addTask('test-task', ['task-dependencies']); };
        expect(dup.bind(this)).toThrowError('Task name test-task already defined');

        dup = function() { this.subject.addTask('test-analysis-task', ['task-dependencies']); };
        expect(dup.bind(this)).toThrowError('Task name test-analysis-task already defined');

        dup = function() { this.subject.addTask('test-analysis-task', ['task-dependencies']); };
        expect(dup.bind(this)).toThrowError('Task name test-analysis-task already defined');

        dup = function() { this.subject.addAnalysisTask('test-task', ['task-dependencies']); };
        expect(dup.bind(this)).toThrowError('Task name test-task already defined');
      });
    });
  });

  describe('Task parameters validation', function() {
    var assertTaskExecution = function(runner) {
      it('it invokes the task function when all required parameters are present', function() {
        gulpFunction();
        expect(mockRunners[runner].run).toHaveBeenCalled();
      });
    };

    beforeEach(function() {
      this.subject = new TaskDefinitions({
        parameters: { testParam1: 123 }
      });
    });

    describe('when successful', function() {
      describe('for a default task', function() {
        beforeEach(function() {
          this.subject.addTask('test-task', {
            description: 'test task description',
            parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
          }, ['task-dependencies'], this.taskFunction);
        });

        assertTaskExecution('default');
      });

      describe('for an analysis task', function() {
        beforeEach(function() {
          this.subject.addAnalysisTask('test-task', {
            description: 'test task description',
            parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
          }, ['task-dependencies'], this.taskFunction);
        });

        assertTaskExecution('report');
      });
    });

    describe('when unsuccessful ', function() {
      describe('for a default task', function() {
        it('it throws an error if any required parameter is not present', function() {
          this.subject.addTask('test-task', {
            description: 'test task description',
            parameters: [{ name: 'testParam2', required: true }]
          }, ['task-dependencies'], this.taskFunction);

          expect(gulpFunction).toThrowError();
        });
      });

      describe('for an analysis task', function() {
        it('it throws an error if any required parameter is not present', function() {
          this.subject.addAnalysisTask('test-task', {
            description: 'test task description',
            parameters: [{ name: 'testParam2', required: true }]
          }, ['task-dependencies'], this.taskFunction);

          expect(gulpFunction).toThrowError();
        });
      });
    });
  });

  describe('Retrieving tasks', function() {
    beforeEach(function() {
      this.subject = new TaskDefinitions({ parameters: { testParam: 123 } });
      this.subject.addTask('test-task1', {
        description: 'test task description',
        parameters: [{ name: 'testParam', required: true }]
      }, this.taskFunction);
      this.subject.addAnalysisTask('test-task2', ['task-dependencies'], this.taskFunction);
    });

    it('returns all the analysis tasks', function() {
      var tasks = this.subject.analysisTasks();
      expect(tasks.length).toEqual(1);
      expect(tasks[0].name).toEqual('test-task2');
    });

    it('returns all the tasks', function() {
      var tasks = this.subject.allTasks();
      expect(tasks.length).toEqual(2);
      expect(tasks[0].name).toEqual('test-task2');
      expect(tasks[1].name).toEqual('test-task1');
    });

    it('returns the existing task', function() {
      var task = this.subject.getTask('test-task1');
      expect(task.name).toEqual('test-task1');
      expect(task.description).toEqual('test task description');
      expect(task.usage).toEqual('gulp test-task1 --testParam=<testParam>');
    });

    it('throws an error for a non existing task', function() {
      var subject = this.subject;
      expect(function() {
        subject.getTask('not-a-task');
      }).toThrowError(CFValidationError);
    });

    it('returns true for a defined task', function() {
      expect(this.subject.isTaskDefined('test-task1')).toBeTruthy();
    });

    it('returns false for a non defined task', function() {
      expect(this.subject.isTaskDefined('not-a-task')).toBeFalsy();
    });
  });
});
