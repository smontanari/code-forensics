/*global require_src*/
var LayerGrouping = require_src('models/layer_grouping');

describe('LayerGrouping', function() {
  it('is empty when initialized with empty values', function() {
    expect(new LayerGrouping().isEmpty()).toBe(true);
    expect(new LayerGrouping([]).isEmpty()).toBe(true);
  });

  it('returns the a simple text representating of the layer path mappings', function() {
    var layers = new LayerGrouping([
      { name: "Layer1", paths: ['test/path1', 'test/path2'] },
      { name: "Layer2", paths: ['test/path3'] }
    ]);

    expect(layers.toString()).toEqual([
      'test/path1 => Layer1',
      'test/path2 => Layer1',
      'test/path3 => Layer2'
    ].join("\n"));
  });

  it('returns the regexp representation of the layer path mappings', function() {
    var layers = new LayerGrouping([
      { name: "Layer1", paths: [/^test\/path1/, /test\/path2$/] },
      { name: "Layer2", paths: [/test\/path3\/((?!.*--abc\.)).*\/files/] }
    ]);

    expect(layers.toString()).toEqual([
      '^test\\/path1$ => Layer1',
      '^test\\/path2$ => Layer1',
      '^test\\/path3\\/((?!.*--abc\\.)).*\\/files$ => Layer2'
    ].join("\n"));
  });

  it('returns the mixed text representation of the layer path mappings', function() {
    var layers = new LayerGrouping([
      { name: "Layer1", paths: ['test/path1', 'test/path2', /test\/path3\/((?!.*--abc\.)).*\/files/] },
      { name: "Layer2", paths: ['test/path4', /test\/path3\/.*--abc\/files/] },
      { name: "Layer3", paths: ['test/path5'] }
    ]);

    expect(layers.toString()).toEqual([
      'test/path1 => Layer1',
      'test/path2 => Layer1',
      '^test\\/path3\\/((?!.*--abc\\.)).*\\/files$ => Layer1',
      'test/path4 => Layer2',
      '^test\\/path3\\/.*--abc\\/files$ => Layer2',
      'test/path5 => Layer3'
    ].join("\n"));
  });
});
