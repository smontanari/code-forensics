/* eslint jest/expect-expect: [1, { "assertFunctionNames": ["expect", "assertLayersRepresentation"] }] */
var LayerGrouping = require('models/layer_grouping');

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
      ].join('\n'));
    });
  });

  describe('individual layers iteration', function() {
    var subject;

    var assertLayersRepresentation = function(layers) {
      expect(layers[0].name).toEqual('layer-1');
      expect(layers[0].value).toEqual('Layer 1');
      expect(layers[0].toString()).toEqual([
        'test/path1 => Layer 1',
        'test/path2 => Layer 1',
        '^test\\/path3\\/((?!.*--abc\\.)).*\\/files$ => Layer 1'
      ].join('\n'));

      expect(layers[1].name).toEqual('a-layer-2');
      expect(layers[1].value).toEqual('a_Layer 2');
      expect(layers[1].toString()).toEqual([
        'test/path4 => a_Layer 2',
        '^test\\/path3\\/.*--abc\\/files$ => a_Layer 2'
      ].join('\n'));

      expect(layers[2].name).toEqual('another-layer-3');
      expect(layers[2].value).toEqual('another layer-3');
      expect(layers[2].toString()).toEqual([
        'test/path5 => another layer-3'
      ].join('\n'));
    };

    beforeEach(function() {
      subject = new LayerGrouping([
        { name: 'Layer 1', paths: ['test/path1', 'test/path2', /test\/path3\/((?!.*--abc\.)).*\/files/] },
        { name: 'a_Layer 2', paths: ['test/path4', /test\/path3\/.*--abc\/files/] },
        { name: 'another layer-3', paths: ['test/path5'] }
      ]);
    });

    describe('each function', function() {
      it('iterates over each individual layer', function() {
        var layers = [];
        subject.each(function(layer) { layers.push(layer); });
        assertLayersRepresentation(layers);
      });
    });

    describe('map function', function() {
      it('iterates over each individual layer', function() {
        assertLayersRepresentation(subject.map(function(layer) { return layer; }));
      });
    });
  });
});
