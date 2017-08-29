var miscTasks = require_src('tasks/misc_tasks');

describe('Misc Tasks', function() {
  describe('generate-layer-grouping-file', function() {
    var contextConfig = {
      layerGroups: {
        'test_group': [
          { name: 'Test Layer1', paths: ['test/path1', /test\/path2\/((?!.*--abc\.)).*\/files/] },
          { name: 'Test Layer2', paths: ['test_path3', /^test\/path4\/.*\.cf$/] }
        ]
      }
    };

    afterEach(function() {
      this.clearTemp();
    });

    describe('with the layer group parameter', function() {
      it('generates a layer grouping file', function(done) {
        var runtime = this.runtimeSetup(miscTasks, contextConfig, { layerGroup: 'test_group' });
        runtime.executePromiseTask('generate-layer-grouping-file').then(function(taskOutput) {
          taskOutput.assertTempFile('layer-grouping.txt', [
            'test/path1 => Test Layer1',
            '^test\\/path2\\/((?!.*--abc\\.)).*\\/files$ => Test Layer1',
            'test_path3 => Test Layer2',
            '^test\\/path4\\/.*\\.cf$ => Test Layer2'
          ].join("\n"));
          done();
        });
      });
    });

    describe('with no layer group parameter', function() {
      it('does not generate a layer grouping file', function(done) {
        var runtime = this.runtimeSetup(miscTasks, contextConfig);
        runtime.executePromiseTask('generate-layer-grouping-file').then(function(taskOutput) {
          taskOutput.assertMissingTempReport('layer-grouping.txt');
          done();
        });
      });
    });
  });
});
