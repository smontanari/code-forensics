/*global require_src*/
var LayerGrouping = require_src('models/layer_grouping');

describe('LayerGrouping', function() {
  it('is empty when initialized with empty values', function() {
    expect(new LayerGrouping().isEmpty()).toBe(true);
    expect(new LayerGrouping([]).isEmpty()).toBe(true);
  });

  describe('all layers', function() {
    it('returns the path mappings representation of all the layers', function() {
      var layers = new LayerGrouping([
        { name: 'Layer 1', paths: ['test/path1', 'test/path2', /test\/path3\/((?!.*--abc\.)).*\/files/] },
        { name: 'a_Layer 2', paths: ['test/path4', /test\/path3\/.*--abc\/files/] },
        { name: 'another layer-3', paths: ['test/path5'] }
      ]);

      expect(layers.toString()).toEqual([
        'test/path1 => Layer 1',
        'test/path2 => Layer 1',
        '^test\\/path3\\/((?!.*--abc\\.)).*\\/files$ => Layer 1',
        'test/path4 => a_Layer 2',
        '^test\\/path3\\/.*--abc\\/files$ => a_Layer 2',
        'test/path5 => another layer-3'
      ].join("\n"));
    });
  });

  describe('individual layers', function() {
    it('returns the text path mappings representation for each individual layer', function() {
      var layers = new LayerGrouping([
        { name: 'Layer 1', paths: ['test/path1', 'test/path2', /test\/path3\/((?!.*--abc\.)).*\/files/] },
        { name: 'a_Layer 2', paths: ['test/path4', /test\/path3\/.*--abc\/files/] },
        { name: 'another layer-3', paths: ['test/path5'] }
      ]);

      var allLayers = layers.map(function(layer) { return layer; });

      expect(allLayers[0].name).toEqual('layer-1');
      expect(allLayers[0].toString()).toEqual([
        'test/path1 => Layer 1',
        'test/path2 => Layer 1',
        '^test\\/path3\\/((?!.*--abc\\.)).*\\/files$ => Layer 1'
      ].join("\n"));

      expect(allLayers[1].name).toEqual('a-layer-2');
      expect(allLayers[1].toString()).toEqual([
        'test/path4 => a_Layer 2',
        '^test\\/path3\\/.*--abc\\/files$ => a_Layer 2'
      ].join("\n"));

      expect(allLayers[2].name).toEqual('another-layer-3');
      expect(allLayers[2].toString()).toEqual([
        'test/path5 => another layer-3'
      ].join("\n"));
    });
  });
});
