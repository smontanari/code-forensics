var Path   = require('path'),
    fs     = require('fs'),
    del    = require('del'),
    mkdirp = require('mkdirp'),
    gulp   = require('gulp'),
    Q      = require('q'),
    _      = require('lodash');

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
};

var Runtime = function(taskFunctions) {
  this.executeStreamTask = function(name) {
    var deferred = Q.defer();
    taskFunctions[name].call()
      .on('close', function() { deferred.resolve(new TaskOutput()); })
      .on('error', function(err) { fail(err); });
    return deferred.promise;
  };

  this.executePromiseTask = function(name) {
    return taskFunctions[name].call()
      .then(function(reportId) { return new TaskOutput(reportId); })
      .catch(function(err) { fail(err); });
  };

  this.prepareTempReport = function(filename, content) {
    fs.writeFileSync(Path.join(TEST_TMP_DIR, filename), JSON.stringify(content));
  };

  this.prepareTempFile = function(filename, content) {
    fs.writeFileSync(Path.join(TEST_TMP_DIR, filename), content);
  };

  this.prepareRepositoryFile = function(filename, content) {
    fs.writeFileSync(Path.join(TEST_REPO_DIR, filename), content);
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
    var taskFunctions = {};
    spyOn(gulp, 'task').and.callFake(function(taskName, deps, fn) {
      taskFunctions[taskName] = fn;
    });

    var config = _.merge({
        tempDir: TEST_TMP_DIR,
        outputDir: TEST_OUTPUT_DIR,
        repository: { rootPath: TEST_REPO_DIR }
      }, contextConfig);

    var taskContext = new TaskContext(config, parameters || {});
    var taskDefinitions = new TaskDefinitions(taskContext);

    tasksFn(taskDefinitions, taskContext, taskHelpers(taskContext));

    return new Runtime(taskFunctions);
  };
});

mkdirp.sync(TEST_TMP_DIR);
mkdirp.sync(TEST_OUTPUT_DIR);
mkdirp.sync(TEST_REPO_DIR);
