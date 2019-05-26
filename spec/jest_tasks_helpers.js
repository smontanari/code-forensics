var Path     = require('path'),
    fs       = require('fs'),
    del      = require('del'),
    mkdirp   = require('mkdirp'),
    gulp     = require('gulp'),
    Bluebird = require('bluebird'),
    _        = require('lodash');

var TaskContext     = require('runtime/task_context'),
    TaskDefinitions = require('models/task/task_definitions'),
    taskHelpers     = require('tasks/helpers');

var TEST_TMP_DIR    = Path.resolve('test_fixtures/tmp'),
    TEST_OUTPUT_DIR = Path.resolve('test_fixtures/output'),
    TEST_REPO_DIR   = Path.resolve('test_fixtures/repo_root');

var readFile = Bluebird.promisify(fs.readFile);

var TaskOutput = function(reportId) {
  this.assertTempFile = function(filename) {
    return readFile(Path.join(TEST_TMP_DIR, filename))
      .then(function(buffer) {
        expect(buffer.toString()).toMatchSnapshot(filename);
      });
  };

  this.assertTempReport = function(filename) {
    return readFile(Path.join(TEST_TMP_DIR, filename))
      .then(function(buffer) {
        expect(buffer.toString()).toMatchSnapshot(filename);
      });
  };

  this.assertMissingTempReports = function(filenames) {
    filenames.forEach(function(filename) {
      expect(fs.existsSync(Path.join(TEST_TMP_DIR, filename))).toBe(false);
    });
    return Bluebird.resolve();
  };

  this.assertMissingTempReport = function(filename) {
    expect(fs.existsSync(Path.join(TEST_TMP_DIR, filename))).toBe(false);
    return Bluebird.resolve();
  };

  this.assertOutputReport = function(filename) {
    return readFile(Path.join(TEST_OUTPUT_DIR, reportId, filename))
      .then(function(buffer) {
        expect(JSON.parse(buffer)).toMatchSnapshot(filename);
      });
  };

  this.assertMissingOutputReport = function(filename) {
    expect(fs.existsSync(Path.join(TEST_OUTPUT_DIR, reportId, filename))).toBe(false);
    return Bluebird.resolve();
  };

  this.assertManifest = function() {
    return readFile(Path.join(TEST_OUTPUT_DIR, reportId, 'manifest.json'))
      .then(function(buffer) {
        expect(JSON.parse(buffer)).toMatchSnapshot('manifest');
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
      .on('error', function(err) { throw err; });
      // .on('error', function(err) { fail(err); });
    });
  };

  this.executePromiseTask = function(name) {
    return gulpTasks[name].run.call(null, doneCallback)
      .then(function(reportId) { return new TaskOutput(reportId); });
      // .catch(function(err) { throw err; });
      // .catch(function(err) { fail(err); });
  };

  this.executeStreamFunction = function(name) {
    return new Bluebird(function(resolve) {
      functions[name].call()
      .on('close', resolve.bind(null, new TaskOutput()))
      .on('error', function(err) { throw err; });
      // .on('error', function(err) { fail(err); });
    });
  };

  this.executePromiseFunction = function(name) {
    return functions[name].call()
      .then(function() { return new TaskOutput(); })
      .catch(function(err) { throw err; });
      // .catch(function(err) { fail(err); });
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
  };
};

module.exports = {
  clearTemp: function() {
    del.sync(TEST_TMP_DIR + '/*');
  },
  clearRepo: function() {
    del.sync(TEST_REPO_DIR + '/*');
  },
  clearOutput: function() {
    del.sync(TEST_OUTPUT_DIR + '/*');
  },
  runtimeSetup: function(tasksFn, contextConfig, parameters) {
    var gulpTasks = {};
    var currentTaskDependencies = [];

    var addToDependecies = function() {
      currentTaskDependencies = currentTaskDependencies.concat(
        _.map(_.filter(arguments, _.isFunction), _.property('name'))
      );
    };
    gulp.parallel.mockImplementation(addToDependecies);
    gulp.series.mockImplementation(function() {
      addToDependecies.apply(null, arguments);
      return _.toArray(arguments).pop();
    });
    gulp.task = jest.fn().mockImplementation(function(taskName, fn) {
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
    taskDefinitions.addTask = jest.fn().mockImplementation(function(taskName, _taskInfo, taskDep) {
      addToDependecies(taskDep);
      gulpTasks[taskName] = { dependencies: _.uniq(currentTaskDependencies) };
      addTask.apply(taskDefinitions, arguments);
      currentTaskDependencies = [];
    });
    taskDefinitions.addAnalysisTask = jest.fn().mockImplementation(function(taskName, _taskInfo, taskDep) {
      addToDependecies(taskDep);
      gulpTasks[taskName] = { dependencies: _.uniq(currentTaskDependencies) };
      addAnalysisTask.apply(taskDefinitions, arguments);
      currentTaskDependencies = [];
    });

    var tasksRuntimeConfig = tasksFn(taskDefinitions, taskContext, taskHelpers(taskContext));
    tasksRuntimeConfig.tasks(); //process the gulp tasks
    return new Runtime(gulpTasks, tasksRuntimeConfig.functions);
  }
};

mkdirp.sync(TEST_TMP_DIR);
mkdirp.sync(TEST_OUTPUT_DIR);
mkdirp.sync(TEST_REPO_DIR);
