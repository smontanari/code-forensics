var GraphDataHelper = require('tasks/helpers/graph_data_helper'),
    graphSupport    = require('graph_support');

describe('GraphDataHelper', function() {
  describe('.weightedTree()', function() {
    var mockTree;
    beforeEach(function() {
      mockTree = {
        withItem: jest.fn(),
        rootNode: jest.fn()
      };
      graphSupport.WeightedTree = jest.fn(function() { return mockTree; });
      mockTree.rootNode.mockReturnValue('test-root');
    });

    it('builds a weighted tree with the report data items', function() {
      var output = new GraphDataHelper().weightedTree(['reportData1', 'reportData2'], 'pathProperty', 'someProperty');

      expect(output).toEqual('test-root');

      expect(graphSupport.WeightedTree).toHaveBeenCalledWith(null, 'pathProperty', {weightedProperty: 'someProperty', normalised: true});
      expect(mockTree.withItem.mock.calls[0][0]).toEqual('reportData1');
      expect(mockTree.withItem.mock.calls[1][0]).toEqual('reportData2');
    });
  });

  describe('.tree()', function() {
    var mockTree;
    beforeEach(function() {
      mockTree = {
        rootNode: 'test-root',
        addNode: jest.fn().mockName('addNode')
      };

      graphSupport.Tree = jest.fn(function() { return mockTree; });
    });

    describe('with a children property name', function() {
      it('builds a tree with the report data items, replacing the named property as the "children" property', function() {
        var data = [
          { path: 'path1', name: 'reportData1', items: [123, 456] },
          { path: 'path1', name: 'reportData2', items: ['qwe', 'zxc'] }
        ];
        var output = new GraphDataHelper().tree(data, 'path', 'items');

        expect(output).toEqual('test-root');

        expect(graphSupport.Tree).toHaveBeenCalledWith(null, 'path');
        expect(mockTree.addNode.mock.calls[0][0]).toEqual({ path: 'path1', name: 'reportData1', children: [123, 456] });
        expect(mockTree.addNode.mock.calls[1][0]).toEqual({ path: 'path1', name: 'reportData2', children: ['qwe', 'zxc'] });
      });
    });

    describe('without a children property name', function() {
      it('builds a tree with the report data items, replacing the named property as the "children" property', function() {
        var data = [
          { path: 'path1', name: 'reportData1' },
          { path: 'path1', name: 'reportData2' }
        ];
        var output = new GraphDataHelper().tree(data, 'path');

        expect(output).toEqual('test-root');

        expect(graphSupport.Tree).toHaveBeenCalledWith(null, 'path');
        expect(mockTree.addNode.mock.calls[0][0]).toEqual({ path: 'path1', name: 'reportData1' });
        expect(mockTree.addNode.mock.calls[1][0]).toEqual({ path: 'path1', name: 'reportData2' });
      });
    });
  });

  describe('.flatWeightedTree()', function() {
    it('returns a tree with only one level of children', function() {
      var output = new GraphDataHelper().flatWeightedTree([
        { pathProperty: 'item1', data: 'reportData1', weightProperty: 5 },
        { pathProperty: 'item2', data: 'reportData2', weightProperty: 3 }
      ], 'weightProperty');

      expect(output).toEqual({
        children: [
          { pathProperty: 'item1', data: 'reportData1', weightProperty: 5, weight: 1 },
          { pathProperty: 'item2', data: 'reportData2', weightProperty: 3, weight: 0.6 }
        ]
      });
    });
  });
});
