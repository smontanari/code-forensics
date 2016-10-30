var Path   = require('path'),
    del    = require('del'),
    mkdirp = require('mkdirp'),
    gulp   = require('gulp'),
    _      = require('lodash');

var TaskContext     = require_src('runtime/task_context'),
    TaskDefinitions = require_src('./models/task/task_definitions'),
    taskHelpers     = require_src('tasks/helpers');

var TEST_TMP_DIR    = Path.resolve('./spec_files/tmp'),
    TEST_OUTPUT_DIR = Path.resolve('./spec_files/output'),
    TEST_REPO_DIR   = Path.resolve('./spec_files/repo_root');

beforeEach(function() {
  this.tasksWorkingFolders = {
    tempDir: TEST_TMP_DIR,
    outputDir: TEST_OUTPUT_DIR,
    repoDir: TEST_REPO_DIR
  };

  this.tasksSetup = function(tasksFn, contextConfig, parameters) {
    var taskFunctions = {};
    spyOn(gulp, 'task').and.callFake(function(taskName, deps, fn) {
      taskFunctions[taskName] = fn;
    });

    del.sync([TEST_TMP_DIR + '/*', TEST_OUTPUT_DIR + '/*', TEST_REPO_DIR + '/*']);

    var config = _.merge({
        tempDir: TEST_TMP_DIR,
        outputDir: TEST_OUTPUT_DIR,
        repository: { rootPath: TEST_REPO_DIR }
      }, contextConfig);

    var taskContext = new TaskContext(config, parameters || {});
    var taskDefinitions = new TaskDefinitions(taskContext);

    tasksFn(taskDefinitions, taskContext, taskHelpers(taskContext));

    return taskFunctions;
  };
});

mkdirp.sync(TEST_TMP_DIR);
mkdirp.sync(TEST_OUTPUT_DIR);
mkdirp.sync(TEST_REPO_DIR);
