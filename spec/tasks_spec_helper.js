var Path   = require('path'),
    del    = require('del'),
    mkdirp = require('mkdirp'),
    _      = require('lodash');

var TaskContext = require_src('runtime/task_context'),
    taskHelpers = require_src('tasks/helpers');

var TEST_TMP_DIR    = Path.resolve('./spec_files/tmp'),
    TEST_OUTPUT_DIR = Path.resolve('./spec_files/output'),
    TEST_REPO_DIR   = Path.resolve('./spec_files/repo_root');

beforeEach(function() {
  var taskFunctions = {};
  var taskDefinitions = {
    add: function(name, desc, fn) { taskFunctions[name] = fn; }
  };

  this.tasksWorkingFolders = {
    tempDir: TEST_TMP_DIR,
    outputDir: TEST_OUTPUT_DIR
  };

  this.tasksSetup = function(tasksFn, configOverride, parameters) {
    del.sync([TEST_TMP_DIR + '/*', TEST_OUTPUT_DIR + '/*']);

    var config = _.merge({
        tempDir: TEST_TMP_DIR,
        outputDir: TEST_OUTPUT_DIR,
        repository: { rootPath: TEST_REPO_DIR }
      }, configOverride);
    var taskContext = new TaskContext(config, parameters);

    tasksFn(taskDefinitions, taskContext, taskHelpers(taskContext));

    return taskFunctions;
  };
});

mkdirp.sync(TEST_TMP_DIR);
mkdirp.sync(TEST_OUTPUT_DIR);
mkdirp.sync(TEST_REPO_DIR);
