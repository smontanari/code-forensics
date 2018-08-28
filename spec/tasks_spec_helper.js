/*global require_src*/
var Path     = require('path'),
    fs       = require('fs'),
    del      = require('del'),
    mkdirp   = require('mkdirp'),
    gulp     = require('gulp'),
    Bluebird = require('bluebird'),
    _        = require('lodash');

var TaskContext     = require_src('runtime/task_context'),
    TaskDefinitions = require_src('models/task/task_definitions'),
    taskHelpers     = require_src('tasks/helpers');

var TEST_TMP_DIR    = Path.resolve('test_fixtures/tmp'),
    TEST_OUTPUT_DIR = Path.resolve('test_fixtures/output'),
    TEST_REPO_DIR   = Path.resolve('test_fixtures/repo_root');

var TaskOutput = function(reportId) {
  this.assertTempFile = function(filename, expectedValue) {
    var content = fs.readFileSync(Path.join(TEST_TMP_DIR, filename));
    expect(content.toString()).toEqual(expectedValue);
  };

  this.assertTempReport = function(filename, expectedValue) {
    var report = JSON.parse(fs.readFileSync(Path.join(TEST_TMP_DIR, filename)));
    expect(report).toEqual(expectedValue);
  };

  this.assertMissingTempReport = function(filename) {
    expect(fs.existsSync(Path.join(TEST_TMP_DIR, filename))).toBe(false);
  };

  this.assertOutputReport = function(filename, expectedValue) {
    var report = JSON.parse(fs.readFileSync(Path.join(TEST_OUTPUT_DIR, reportId, filename)));
    expect(report).toEqual(expectedValue);
  };

  this.assertMissingOutputReport = function(filename) {
    expect(fs.existsSync(Path.join(TEST_OUTPUT_DIR, reportId, filename))).toBe(false);
  };

  this.assertManifest = function(options) {
    var manifest = JSON.parse(fs.readFileSync(Path.join(TEST_OUTPUT_DIR, reportId, 'manifest.json')));
    _.each(options, function(expectedValue, key) {
      expect(manifest[key]).toEqual(expectedValue);
    });
  };

  this.assertMissingReportId = function() {
    expect(reportId).toBeUndefined();
  };
};

var doneCallback = function() {};

var Runtime = function(gulpTasks, functions) {
  this.executeStreamTask = function(name) {
    return new Bluebird(function(resolve) {
      gulpTasks[name].run.call(null, doneCallback)
      .on('close', resolve.bind(null, new TaskOutput()))
      .on('error', function(err) { fail(err); });
    });
  };

  this.executePromiseTask = function(name) {
    return gulpTasks[name].run.call(null, doneCallback)
      .then(function(reportId) { return new TaskOutput(reportId); })
      .catch(function(err) { fail(err); });
  };

  this.executePromiseFunction = function(name) {
    return functions[name].call()
      .then(function() { return new TaskOutput(); })
      .catch(function(err) { fail(err); });
  };

  this.prepareTempReport = function(filename, content) {
    fs.writeFileSync(Path.join(TEST_TMP_DIR, filename), JSON.stringify(content));
  };

  this.prepareTempFile = function(filename, content) {
    fs.writeFileSync(Path.join(TEST_TMP_DIR, filename), content);
  };

  this.prepareRepositoryFile = function(filename, content) {
    var folder = Path.join(TEST_REPO_DIR, Path.dirname(filename));
    mkdirp.sync(folder);
    fs.writeFileSync(Path.join(TEST_REPO_DIR, filename), content);
  };

  this.assertTaskDependencies = function(name, dependencies) {
    _.each(dependencies, function(dependency) {
      expect(gulpTasks[name].dependencies).toContain(dependency);
    });
    expect(gulpTasks[name].dependencies.length).toEqual(dependencies.length);
  };
};

beforeEach(function() {
  this.clearTemp = function() {
    del.sync(TEST_TMP_DIR + '/*');
  };

  this.clearRepo = function() {
    del.sync(TEST_REPO_DIR + '/*');
  };

  this.clearOutput = function() {
    del.sync(TEST_OUTPUT_DIR + '/*');
  };

  this.runtimeSetup = function(tasksFn, contextConfig, parameters) {
    var gulpTasks = {};
    var currentTaskDependencies = [];

    var addToDependecies = function() {
      currentTaskDependencies = currentTaskDependencies.concat(
        _.map(_.filter(arguments, _.isFunction), _.property('name'))
      );
    };
    spyOn(gulp, 'parallel').and.callFake(addToDependecies);
    spyOn(gulp, 'series').and.callFake(function() {
      addToDependecies.apply(null, arguments);
      return _.toArray(arguments).pop();
    });
    spyOn(gulp, 'task').and.callFake(function(taskName, fn) {
      if (fn) {
        gulpTasks[taskName].run = fn;
      }
      return {};
    });

    var config = _.merge({
        tempDir: TEST_TMP_DIR,
        outputDir: TEST_OUTPUT_DIR,
        repository: { rootPath: TEST_REPO_DIR }
      }, contextConfig);

    var taskContext = new TaskContext(config, parameters || {});
    var taskDefinitions = new TaskDefinitions(taskContext);

    var addTask = taskDefinitions.addTask;
    var addAnalysisTask = taskDefinitions.addAnalysisTask;
    spyOn(taskDefinitions, 'addTask').and.callFake(function(taskName) {
      gulpTasks[taskName] = { dependencies: currentTaskDependencies };
      currentTaskDependencies = [];
      return addTask.apply(taskDefinitions, arguments);
    });
    spyOn(taskDefinitions, 'addAnalysisTask').and.callFake(function(taskName) {
      gulpTasks[taskName] = { dependencies: currentTaskDependencies };
      currentTaskDependencies = [];
      return addAnalysisTask.apply(taskDefinitions, arguments);
    });

    var tasksRuntimeConfig = tasksFn(taskDefinitions, taskContext, taskHelpers(taskContext));
    tasksRuntimeConfig.tasks(); //process the gulp tasks
    return new Runtime(gulpTasks, tasksRuntimeConfig.functions);
  };
});

mkdirp.sync(TEST_TMP_DIR);
mkdirp.sync(TEST_OUTPUT_DIR);
mkdirp.sync(TEST_REPO_DIR);
