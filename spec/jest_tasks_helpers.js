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

var TEST_FIXTURES_DIR  = Path.resolve('test_fixtures/'),
    TMP_FOLDER         = 'tmp',
    OUTPUT_FOLDER      = 'output',
    REPO_FOLDER        = 'repo_root';

var readFile = Bluebird.promisify(fs.readFile);

var TaskException = function(originalError, taskOutput) {
  this.taskException = originalError;
  this.taskOutput = taskOutput;
};

var TaskOutput = function(dataDir, reportId) {
  this.assertTempFile = function(filename) {
    return readFile(Path.join(dataDir, TMP_FOLDER, filename))
      .then(function(buffer) {
        expect(buffer.toString()).toMatchSnapshot(filename);
      });
  };

  this.assertTempReport = function(filename) {
    return readFile(Path.join(dataDir, TMP_FOLDER, filename))
      .then(function(buffer) {
        expect(buffer.toString()).toMatchSnapshot(filename);
      });
  };

  this.assertMissingTempReports = function(filenames) {
    filenames.forEach(function(filename) {
      expect(fs.existsSync(Path.join(dataDir, TMP_FOLDER, filename))).toBe(false);
    });
    return Bluebird.resolve();
  };

  this.assertMissingTempReport = function(filename) {
    expect(fs.existsSync(Path.join(dataDir, TMP_FOLDER, filename))).toBe(false);
    return Bluebird.resolve();
  };

  this.assertOutputReport = function(filename) {
    return readFile(Path.join(dataDir, OUTPUT_FOLDER, reportId, filename))
      .then(function(buffer) {
        expect(JSON.parse(buffer)).toMatchSnapshot(filename);
      });
  };

  this.assertMissingOutputReport = function(filename) {
    expect(fs.existsSync(Path.join(dataDir, OUTPUT_FOLDER, reportId, filename))).toBe(false);
    return Bluebird.resolve();
  };

  this.assertManifest = function() {
    return readFile(Path.join(dataDir, OUTPUT_FOLDER, reportId, 'manifest.json'))
      .then(function(buffer) {
        expect(JSON.parse(buffer)).toMatchSnapshot('manifest');
      });
  };

  this.assertMissingReportId = function() {
    expect(reportId).toBeUndefined();
  };
};

var doneCallback = function() {};

var Runtime = function(dataDir, gulpTasks, functions) {
  this.executeStreamTask = function(name) {
    return new Bluebird(function(resolve) {
      gulpTasks[name].run.call(null, doneCallback)
      .on('close', resolve.bind(null, new TaskOutput(dataDir)))
      .on('error', function(err) { throw new TaskException(err, new TaskOutput(dataDir)); });
    });
  };

  this.executePromiseTask = function(name) {
    return gulpTasks[name].run.call(null, doneCallback)
      .then(function(reportId) { return new TaskOutput(dataDir, reportId); })
      .catch(function(error) { return Bluebird.reject(new TaskException(error, new TaskOutput(dataDir))); });
  };

  this.executeStreamFunction = function(name) {
    return new Bluebird(function(resolve) {
      functions[name].call()
      .on('close', resolve.bind(null, new TaskOutput(dataDir)))
      .on('error', function(err) { throw new TaskException(err, new TaskOutput(dataDir)); });
    });
  };

  this.executePromiseFunction = function(name) {
    return functions[name].call()
      .then(function() { return new TaskOutput(dataDir); })
      .catch(function(err) { throw new TaskException(err, new TaskOutput(dataDir)); });
  };

  this.prepareTempReport = function(filename, content) {
    fs.writeFileSync(Path.join(dataDir, TMP_FOLDER, filename), JSON.stringify(content));
  };

  this.prepareTempFile = function(filename, content) {
    fs.writeFileSync(Path.join(dataDir, TMP_FOLDER, filename), content);
  };

  this.prepareRepositoryFile = function(filename, content) {
    var folder = Path.join(dataDir, REPO_FOLDER, Path.dirname(filename));
    mkdirp.sync(folder);
    fs.writeFileSync(Path.join(dataDir, REPO_FOLDER, filename), content);
  };

  this.assertTaskDependencies = function(name, dependencies) {
    _.each(dependencies, function(dependency) {
      expect(gulpTasks[name].dependencies).toContain(dependency);
    });
  };

  this.clear = function() {
    return del(dataDir);
  };
};

module.exports = {
  createRuntime: function(name, tasksFn, contextConfig, parameters) {
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

    mkdirp.sync(TEST_FIXTURES_DIR);
    var runtimeDataDir = fs.mkdtempSync(Path.join(TEST_FIXTURES_DIR, name + '_'));
    var config = _.merge({
      tempDir: Path.join(runtimeDataDir, TMP_FOLDER),
      outputDir: Path.join(runtimeDataDir, OUTPUT_FOLDER),
      repository: { rootPath: Path.join(runtimeDataDir, REPO_FOLDER) }
    }, contextConfig);
    mkdirp.sync(config.tempDir);
    mkdirp.sync(config.outputDir);
    mkdirp.sync(config.repository.rootPath);

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
    return new Runtime(runtimeDataDir, gulpTasks, tasksRuntimeConfig.functions);
  }
};
