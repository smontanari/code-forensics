/* eslint-disable jest/expect-expect */
var Bluebird = require('bluebird');

var miscTasks = require('tasks/misc_tasks');

var taskHelpers = require('../jest_tasks_helpers');

describe('Misc Tasks', function() {
  describe('generate-layer-grouping-files', function() {
    var runtime;
    var contextConfig = {
      layerGroups: {
        'test_group': [
          { name: 'Test Layer1', paths: ['test/path1', /test\/path2\/((?!.*--abc\.)).*\/files/] },
          { name: 'Test Layer2', paths: ['test_path3', /^test\/path4\/.*\.cf$/] }
        ]
      }
    };

    afterEach(function() {
      return runtime.clear();
    });

    describe('with the layer group parameter', function() {
      var assertLayerFiles = function(taskOutput) {
        return Bluebird.all([
          taskOutput.assertTempFile('layer-groups.txt'),
          taskOutput.assertTempFile('layer-group-test-layer-1.txt'),
          taskOutput.assertTempFile('layer-group-test-layer-2.txt')
        ]);
      };

      beforeEach(function() {
        runtime = taskHelpers.createRuntime('misc_tasks', miscTasks, contextConfig, { layerGroup: 'test_group' });
      });

      describe('as a Task', function() {
        it('generates layer grouping files', function() {
          return runtime.executePromiseTask('generate-layer-grouping-files')
            .then(assertLayerFiles);
        });
      });

      describe('as a Function', function() {
        it('generates layer grouping files', function() {
          return runtime.executePromiseFunction('generateLayerGroupingFiles')
            .then(assertLayerFiles);
        });
      });
    });

    describe('with no layer group parameter', function() {
      var assertNoLayerFiles = function(taskOutput) {
        return taskOutput.assertMissingTempReports([
          'layer-groups.txt',
          'layer-group-test-layer-1.txt',
          'layer-group-test-layer-2.txt'
        ]);
      };

      beforeEach(function() {
        runtime = taskHelpers.createRuntime('misc_tasks', miscTasks, contextConfig);
      });

      describe('as a Task', function() {
        it('does not generate layer grouping files', function() {
          return runtime.executePromiseTask('generate-layer-grouping-files')
            .then(assertNoLayerFiles);
        });
      });

      describe('as a Function', function() {
        it('does not generate a layer grouping file', function() {
          return runtime.executePromiseFunction('generateLayerGroupingFiles')
            .then(assertNoLayerFiles);
        });
      });
    });
  });
});
