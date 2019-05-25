/*global require_src cfHelpers*/
var miscTasks = require_src('tasks/misc_tasks');

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
      cfHelpers.clearTemp();
    });

    describe('with the layer group parameter', function() {
      var assertLayerFiles = function(taskOutput) {
        return taskOutput.assertTempFile('layer-groups.txt', [
          'test/path1 => Test Layer1',
          '^test\\/path2\\/((?!.*--abc\\.)).*\\/files$ => Test Layer1',
          'test_path3 => Test Layer2',
          '^test\\/path4\\/.*\\.cf$ => Test Layer2'
        ].join('\n')).then(function() {
          return taskOutput.assertTempFile('layer-group-test-layer-1.txt', [
            'test/path1 => Test Layer1',
            '^test\\/path2\\/((?!.*--abc\\.)).*\\/files$ => Test Layer1'
          ].join('\n'));
        }).then(function() {
          return taskOutput.assertTempFile('layer-group-test-layer-2.txt', [
            'test_path3 => Test Layer2',
            '^test\\/path4\\/.*\\.cf$ => Test Layer2'
          ].join('\n'));
        });
      };

      beforeEach(function() {
        runtime = cfHelpers.runtimeSetup(miscTasks, contextConfig, { layerGroup: 'test_group' });
      });

      describe('as a Task', function() {
        it('generates layer grouping files', function() {
          return runtime.executePromiseTask('generate-layer-grouping-files').then(assertLayerFiles);
        });
      });

      describe('as a Function', function() {
        it('generates layer grouping files', function() {
          return runtime.executePromiseFunction('generateLayerGroupingFiles').then(assertLayerFiles);
        });
      });
    });

    describe('with no layer group parameter', function() {
      var assertNoLayerFiles = function(taskOutput) {
        return taskOutput.assertMissingTempReport('layer-groups.txt')
        .then(function() {
          return taskOutput.assertMissingTempReport('layer-group-test-layer-1.txt');
        }).then(function() {
          return taskOutput.assertMissingTempReport('layer-group-test-layer-2.txt');
        });
      };

      beforeEach(function() {
        runtime = cfHelpers.runtimeSetup(miscTasks, contextConfig);
      });

      describe('as a Task', function() {
        it('does not generate layer grouping files', function() {
          return runtime.executePromiseTask('generate-layer-grouping-files').then(assertNoLayerFiles);
        });
      });

      describe('as a Function', function() {
        it('does not generate a layer grouping file', function() {
          return runtime.executePromiseFunction('generateLayerGroupingFiles').then(assertNoLayerFiles);
        });
      });
    });
  });
});
