var _    = require('lodash'),
    gulp = require('gulp'),
    diff = require('jest-diff');

var TaskDefinitions   = require('models/task/task_definitions'),
    CFValidationError = require('runtime/errors').CFValidationError,
    runners           = require('models/task/runners');

jest.mock('gulp');

expect.extend({
  toBeAGulpTaskLike: function(actual, expected) {
    // var pass = this.equals(actual, expected);
    var pass = actual.name === expected.name &&
      actual.dependency === expected.dependency &&
      actual.description === expected.description &&
      this.equals(actual.parameters, expected.parameters) &&
      actual.run === expected.run;

    return {
      pass: pass,
      message: function() {
        if (!pass) {
          var difference = diff(expected, actual, { expand: this.expand });
          return (difference && difference.includes('- Expect')
            ? 'Difference:\n\n' + difference
            : 'Expected: ' + this.utils.printExpected(expected) + '\n' +
              'Received: ' + this.utils.printReceived(actual)
          );
        }
      }
    };
  }
});

describe('TaskDefinitions', function() {
  var gulpTask,
      // gulpTaskFn,
      // gulpSeries,
      taskRunnerFunction,
      mockRunners,
      mockDependency,
      doneCallback,
      subject;

  beforeEach(function() {
    mockRunners = {
      default: { run: jest.fn().mockReturnValue('default-output') },
      report: { run: jest.fn().mockReturnValue('report-output') }
    };

    // gulpTaskFn = spyOn(gulp, 'task');
    // gulpSeries = spyOn(gulp, 'series');
    gulpTask = {};
    gulp.task.mockImplementation(function(_, fn) {
      if (fn) {
        taskRunnerFunction = fn;
      }
      return gulpTask;
    });
    gulp.series.mockImplementation(function() {
      var fns = _.toArray(arguments);
      return function(done) {
        var outputValues = fns.map(function(fn) { return fn.call(null, done); });
        return outputValues.pop();
      };
    });
    runners.Default = jest.fn().mockImplementation(function() { return mockRunners.default; });
    runners.Report = jest.fn().mockImplementation(function() { return mockRunners.report; });
    mockDependency = jest.fn().mockReturnValue('dependency-output');
    doneCallback = jest.fn();
  });

  var assertGulpInvocation = function(parameters, dependency, runner, description) {
    it('serializes the task function with the dependencies', function() {
      var gulpSeriesFns = [];
      if (parameters) { gulpSeriesFns.push(expect.any(Function)); }
      if (dependency) { gulpSeriesFns.push(mockDependency); }
      if (runner) { gulpSeriesFns.push(mockRunners[runner].run); }

      if (gulpSeriesFns.length > 1) {
        expect(gulp.series.mock.calls[0]).toEqual(gulpSeriesFns);
      } else {
        expect(gulp.series.mock.calls).toHaveLength(0);
      }
    });

    it('adds a task with gulp', function() {
      expect(gulp.task).toHaveBeenCalledWith('test-task', expect.any(Function));
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
      expect(runners.Default.mock.calls).toHaveLength(0);
      expect(runners.Report.mock.calls).toHaveLength(0);
    });
  };

  var assertDefaultRunnerInvocation = function(expectations) {
    it('executes the task function through the default runner', function() {
      var output = taskRunnerFunction(doneCallback);
      var expectedTask = _.pick(expectations, ['name', 'description', 'parameters', 'run']);
      if (expectations.dependency) {
        expectedTask.dependency = mockDependency;
      }

      expect(output).toEqual('default-output');
      expect(runners.Default.mock.calls[0][0]).toBeAGulpTaskLike(expectedTask);
      expect(mockRunners.default.run).toHaveBeenCalledWith(doneCallback);
    });
  };

  var assertReportRunnerInvocation = function(expectations) {
    it('executes the task function through the report runner', function() {
      var output = taskRunnerFunction(doneCallback);
      var expectedTask = _.pick(expectations, ['name', 'description', 'parameters', 'run']);
      if (expectations.dependency) {
        expectedTask.dependency = mockDependency;
      }

      expect(output).toEqual('report-output');
      expect(runners.Report.mock.calls[0][0]).toBeAGulpTaskLike(expectedTask);
      expect(mockRunners.report.run).toHaveBeenCalledWith(doneCallback);
    });
  };

  describe('Adding task definitions', function() {
    beforeEach(function() {
      subject = new TaskDefinitions({ parameters: []});
    });

    describe('adding a task without dependencies', function() {
      beforeEach(function() {
        subject.addTask('test-task', { run: 'taskFunction' });
      });

      assertGulpInvocation(false, false, 'default', 'No description available');
      assertDefaultRunnerInvocation({
        name: 'test-task', run: 'taskFunction', description: 'No description available', parameters: []
      });
    });

    describe('adding a task with dependencies only', function() {
      beforeEach(function() {
        subject.addTask('test-task', mockDependency);
      });

      assertGulpInvocation(false, true, undefined, 'No description available');
      assertNoRunnerInvocation();
    });

    describe('adding a task with dependencies', function() {
      beforeEach(function() {
        subject.addTask('test-task', { run: 'taskFunction' }, mockDependency);
      });

      assertGulpInvocation(false, true, 'default', 'No description available');
      assertDefaultRunnerInvocation({
        name: 'test-task', dependency: true, run: 'taskFunction', description: 'No description available', parameters: []
      });
    });

    describe('adding a task with information', function() {
      beforeEach(function() {
        subject.addTask('test-task', {
          description: 'test task description',
          run: 'taskFunction',
          parameters: [{ name: 'testParam' }]
        }, mockDependency);
      });

      assertGulpInvocation(true, true, 'default', 'test task description');
      assertDefaultRunnerInvocation({
        name: 'test-task', dependency: true, run: 'taskFunction', description: 'test task description', parameters: [{ name: 'testParam' }]
      });
    });

    describe('adding an analysis task without information', function() {
      beforeEach(function() {
        subject.addAnalysisTask('test-task', { run: 'taskFunction' }, mockDependency);
      });

      assertGulpInvocation(false, true, 'report', 'No description available');
      assertReportRunnerInvocation({
        name: 'test-task', dependency: true, run: 'taskFunction', description: 'No description available', parameters: []
      });
    });

    describe('adding an analysis task with information', function() {
      beforeEach(function() {
        subject.addAnalysisTask('test-task', {
          description: 'test task description',
          run: 'taskFunction',
          parameters: [{ name: 'testParam' }]
        });
      });

      assertGulpInvocation(true, false, 'report', 'test task description');
      assertReportRunnerInvocation({
        name: 'test-task', run: 'taskFunction', description: 'test task description', parameters: [{ name: 'testParam' }]
      });
    });

    describe('adding a duplicate task definition', function() {
      beforeEach(function() {
        subject.addTask('test-task', { run: 'taskFunction' }, mockDependency);
        subject.addAnalysisTask('test-analysis-task', { run: 'taskFunction' });
      });

      it('throws an error', function() {
        var dup = function() { subject.addTask('test-task', { run: 'taskFunction' }); };

        expect(dup.bind(this)).toThrow('Task name test-task already defined');

        dup = function() { subject.addTask('test-task', mockDependency); };

        expect(dup.bind(this)).toThrow('Task name test-task already defined');

        dup = function() { subject.addTask('test-analysis-task', { run: 'taskFunction' }); };

        expect(dup.bind(this)).toThrow('Task name test-analysis-task already defined');

        dup = function() { subject.addTask('test-analysis-task', mockDependency); };

        expect(dup.bind(this)).toThrow('Task name test-analysis-task already defined');
      });
    });
  });

  describe('Task parameters validation', function() {
    beforeEach(function() {
      subject = new TaskDefinitions({
        parameters: { testParam1: 123 }
      });
    });

    describe('when successful', function() {
      describe('for a default task', function() {
        beforeEach(function() {
          subject.addTask('test-task', {
            description: 'test task description',
            run: 'taskFunction',
            parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
          }, mockDependency);
        });

        assertDefaultRunnerInvocation({
          name: 'test-task', dependency: true, run: 'taskFunction', description: 'test task description', parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
        });
      });

      describe('for an analysis task', function() {
        beforeEach(function() {
          subject.addAnalysisTask('test-task', {
            description: 'test task description',
            run: 'taskFunction',
            parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
          }, mockDependency);
        });

        assertReportRunnerInvocation({
          name: 'test-task', dependency: true, run: 'taskFunction', description: 'test task description', parameters: [{ name: 'testParam1', required: true }, { name: 'testParam2' }]
        });
      });
    });

    describe('when unsuccessful ', function() {
      describe('for a default task', function() {
        it('it throws an error if any required parameter is not present', function() {
          subject.addTask('test-task', {
            description: 'test task description',
            run: 'taskFunction',
            parameters: [{ name: 'testParam2', required: true }]
          }, 'task-dependencies');

          expect(taskRunnerFunction).toThrow();
        });
      });

      describe('for an analysis task', function() {
        it('it throws an error if any required parameter is not present', function() {
          subject.addAnalysisTask('test-task', {
            description: 'test task description',
            run: 'taskFunction',
            parameters: [{ name: 'testParam2', required: true }]
          }, 'task-dependencies');

          expect(taskRunnerFunction).toThrow();
        });
      });
    });
  });

  describe('Retrieving tasks', function() {
    beforeEach(function() {
      subject = new TaskDefinitions({ parameters: { testParam: 123 } });
      subject.addTask('test-task1', {
        description: 'test task description',
        run: 'taskFunction',
        parameters: [{ name: 'testParam', required: true }]
      });
      subject.addAnalysisTask('test-task2', { run: 'taskFunction' }, mockDependency);
    });

    it('returns all the analysis tasks', function() {
      var tasks = subject.analysisTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0].name).toEqual('test-task2');
    });

    it('returns all the tasks', function() {
      var tasks = subject.allTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].name).toEqual('test-task2');
      expect(tasks[1].name).toEqual('test-task1');
    });

    it('returns the existing task', function() {
      var task = subject.getTask('test-task1');

      expect(task.name).toEqual('test-task1');
      expect(task.description).toEqual('test task description');
      expect(task.usage).toEqual('gulp test-task1 --testParam=<testParam>');
    });

    it('throws an error for a non existing task', function() {
      expect(function() {
        subject.getTask('not-a-task');
      }).toThrow(CFValidationError);
    });

    it('returns true for a defined task', function() {
      expect(subject.isTaskDefined('test-task1')).toBeTruthy();
    });

    it('returns false for a non defined task', function() {
      expect(subject.isTaskDefined('not-a-task')).toBeFalsy();
    });
  });
});
