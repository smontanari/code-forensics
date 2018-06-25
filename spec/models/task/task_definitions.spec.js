/*eslint-disable max-lines*/
/*global require_src*/
var _    = require('lodash'),
    gulp = require('gulp');

var TaskDefinitions   = require_src('models/task/task_definitions'),
    CFValidationError = require_src('models/validation_error'),
    runners           = require_src('models/task/runners');

describe('TaskDefinitions', function() {
  var gulpTask,
      gulpTaskFn,
      gulpSeries,
      taskRunnerFunction,
      mockRunners,
      mockDependency,
      doneCallback;

  beforeEach(function() {
    jasmine.addMatchers({
      toBeAGulpTaskLike: function(util) {
        return {
          compare: function(actual, expected) {
            var result = {};
            result.pass =
              actual.name === expected.name &&
              actual.dependency === (expected.dependency ? mockDependency : undefined) &&
              actual.description === expected.description &&
              util.equals(actual.parameters, expected.parameters) &&
              actual.run === expected.taskFunction;

            return result;
          }
        };
      }
    });

    mockRunners = {
      default: { run: jasmine.createSpy('defaultRunner').and.returnValue('default-output') },
      report: { run: jasmine.createSpy('reportRunner').and.returnValue('report-output') }
    };

    gulpTaskFn = spyOn(gulp, 'task');
    gulpSeries = spyOn(gulp, 'series');
    gulpTask = {};
    gulpTaskFn.and.callFake(function(_, fn) {
      if (fn) {
        taskRunnerFunction = fn;
      }
      return gulpTask;
    });
    gulpSeries.and.callFake(function() {
      var fns = _.toArray(arguments);
      return function(done) {
        var outputValues = fns.map(function(fn) { return fn.call(null, done); });
        return outputValues.pop();
      };
    });
    spyOn(runners, 'Default').and.returnValue(mockRunners.default);
    spyOn(runners, 'Report').and.returnValue(mockRunners.report);
    mockDependency = jasmine.createSpy('dependency').and.returnValue('dependency-output');
    doneCallback = jasmine.createSpy('doneCallback');
  });

  var assertGulpInvocation = function(parameters, dependency, runner, description) {
    it('serializes the task function with the dependencies', function() {
      var gulpSeriesFns = [];
      if (parameters) { gulpSeriesFns.push(jasmine.any(Function)); }
      if (dependency) { gulpSeriesFns.push(mockDependency); }
      if (runner) { gulpSeriesFns.push(mockRunners[runner].run); }

      if (gulpSeriesFns.length > 1) {
        expect(gulpSeries.calls.mostRecent().args).toEqual(gulpSeriesFns);
      } else {
        expect(gulpSeries.calls.count()).toEqual(0);
      }
    });

    it('adds a task with gulp', function() {
      expect(gulpTaskFn).toHaveBeenCalledWith('test-task', jasmine.any(Function));
    });

    it('sets the gulp task description', function() {
      expect(gulpTask.description).toEqual(description);
    });
  };

  var assertNoRunnerInvocation = function() {
    it('does not execute any runner', function() {
      var output = taskRunnerFunction(doneCallback);

      expect(output).toEqual('dependency-output');
      expect(mockDependency).toHaveBeenCalledWith(doneCallback);
      expect(runners.Default.calls.count()).toEqual(0);
      expect(runners.Report.calls.count()).toEqual(0);
    });
  };

  var assertDefaultRunnerInvocation = function(expectedTask) {
    it('executes the task function through the default runner', function() {
      var output = taskRunnerFunction(doneCallback);

      expect(output).toEqual('default-output');
      expect(runners.Default.calls.first().args[0]).toBeAGulpTaskLike(expectedTask);
      expect(mockRunners.default.run).toHaveBeenCalledWith(doneCallback);
    });
  };

  var assertReportRunnerInvocation = function(expectedTask) {
    it('executes the task function through the report runner', function() {
      var output = taskRunnerFunction(doneCallback);

      expect(output).toEqual('report-output');
      expect(runners.Report.calls.first().args[0]).toBeAGulpTaskLike(expectedTask);
      expect(mockRunners.report.run).toHaveBeenCalledWith(doneCallback);
    });
  };

  describe('Adding task definitions', function() {
    beforeEach(function() {
      this.subject = new TaskDefinitions({ parameters: []});
    });

    describe('adding a task without dependencies', function() {
      beforeEach(function() {
        this.subject.addTask('test-task', { run: 'taskFunction' });
      });

      assertGulpInvocation(false, false, 'default', 'No description available');
      assertDefaultRunnerInvocation({
        name: 'test-task', dependency: false, taskFunction: 'taskFunction', description: 'No description available', parameters: []
      });
    });

    describe('adding a task with dependencies only', function() {
      beforeEach(function() {
        this.subject.addTask('test-task', mockDependency);
      });

      assertGulpInvocation(false, true, undefined, 'No description available');
      assertNoRunnerInvocation();
    });

    describe('adding a task with dependencies', function() {
      beforeEach(function() {
        this.subject.addTask('test-task', { run: 'taskFunction' }, mockDependency);
      });

      assertGulpInvocation(false, true, 'default', 'No description available');
      assertDefaultRunnerInvocation({
        name: 'test-task', dependency: true, taskFunction: 'taskFunction', description: 'No description available', parameters: []
      });
    });

    describe('adding a task with information', function() {
      beforeEach(function() {
        this.subject.addTask('test-task', {
          description: 'test task description',
          run: 'taskFunction',
          parameters: [{ name: 'testParam' }]
        }, mockDependency);
      });

      assertGulpInvocation(true, true, 'default', 'test task description');
      assertDefaultRunnerInvocation({
        name: 'test-task', dependency: true, taskFunction: 'taskFunction', description: 'test task description', parameters: [{ name: 'testParam' }]
      });
    });

    describe('adding an analysis task without information', function() {
      beforeEach(function() {
        this.subject.addAnalysisTask('test-task', { run: 'taskFunction' }, mockDependency);
      });

      assertGulpInvocation(false, true, 'report', 'No description available');
      assertReportRunnerInvocation({
        name: 'test-task', dependency: true, taskFunction: 'taskFunction', description: 'No description available', parameters: []
      });
    });

    describe('adding an analysis task with information', function() {
      beforeEach(function() {
        this.subject.addAnalysisTask('test-task', {
          description: 'test task description',
          run: 'taskFunction',
          parameters: [{ name: 'testParam' }]
        });
      });

      assertGulpInvocation(true, false, 'report', 'test task description');
      assertReportRunnerInvocation({
        name: 'test-task', dependency: false, taskFunction: 'taskFunction', description: 'test task description', parameters: [{ name: 'testParam' }]
      });
    });

    describe('adding a duplicate task definition', function() {
      beforeEach(function() {
        this.subject.addTask('test-task', { run: 'taskFunction' }, mockDependency);
        this.subject.addAnalysisTask('test-analysis-task', { run: 'taskFunction' });
      });

      it('throws an error', function() {
        var dup = function() { this.subject.addTask('test-task', { run: 'taskFunction' }); };

        expect(dup.bind(this)).toThrowError('Task name test-task already defined');

        dup = function() { this.subject.addTask('test-task', mockDependency); };

        expect(dup.bind(this)).toThrowError('Task name test-task already defined');

        dup = function() { this.subject.addTask('test-analysis-task', { run: 'taskFunction' }); };

        expect(dup.bind(this)).toThrowError('Task name test-analysis-task already defined');

        dup = function() { this.subject.addTask('test-analysis-task', mockDependency); };

        expect(dup.bind(this)).toThrowError('Task name test-analysis-task already defined');
      });
    });
  });

  describe('Task parameters validation', function() {
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
            run: 'taskFunction',
            parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
          }, mockDependency);
        });

        assertDefaultRunnerInvocation({
          name: 'test-task', dependency: true, taskFunction: 'taskFunction', description: 'test task description', parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
        });
      });

      describe('for an analysis task', function() {
        beforeEach(function() {
          this.subject.addAnalysisTask('test-task', {
            description: 'test task description',
            run: 'taskFunction',
            parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
          }, mockDependency);
        });

        assertReportRunnerInvocation({
          name: 'test-task', dependency: true, taskFunction: 'taskFunction', description: 'test task description', parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
        });
      });
    });

    describe('when unsuccessful ', function() {
      describe('for a default task', function() {
        it('it throws an error if any required parameter is not present', function() {
          this.subject.addTask('test-task', {
            description: 'test task description',
            run: 'taskFunction',
            parameters: [{ name: 'testParam2', required: true }]
          }, 'task-dependencies');

          expect(taskRunnerFunction).toThrowError();
        });
      });

      describe('for an analysis task', function() {
        it('it throws an error if any required parameter is not present', function() {
          this.subject.addAnalysisTask('test-task', {
            description: 'test task description',
            run: 'taskFunction',
            parameters: [{ name: 'testParam2', required: true }]
          }, 'task-dependencies');

          expect(taskRunnerFunction).toThrowError();
        });
      });
    });
  });

  describe('Retrieving tasks', function() {
    beforeEach(function() {
      this.subject = new TaskDefinitions({ parameters: { testParam: 123 } });
      this.subject.addTask('test-task1', {
        description: 'test task description',
        run: 'taskFunction',
        parameters: [{ name: 'testParam', required: true }]
      });
      this.subject.addAnalysisTask('test-task2', { run: 'taskFunction' }, mockDependency);
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
