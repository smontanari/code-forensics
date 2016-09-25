var GraphDataHelper = require_src('tasks/helpers/graph_data_helper'),
    graphSupport    = require_src('graph_support');

describe('GraphDataHelper', function() {
  describe('.weightedTree()', function() {
    var mockTree;
    beforeEach(function() {
      mockTree = jasmine.createSpyObj('tree', ['withItem', 'rootNode']);
      spyOn(graphSupport, 'WeightedTree').and.returnValue(mockTree);
      mockTree.rootNode.and.returnValue('test-root');
    });

    it('builds a weighted tree with the report data items', function() {
      var output = new GraphDataHelper().weightedTree(['reportData1', 'reportData2'], 'pathProperty', 'someProperty');

      expect(output).toEqual('test-root');

      expect(graphSupport.WeightedTree).toHaveBeenCalledWith(null, 'pathProperty', {weightedProperty: 'someProperty', normalised: true});
      expect(mockTree.withItem.calls.argsFor(0)[0]).toEqual('reportData1');
      expect(mockTree.withItem.calls.argsFor(1)[0]).toEqual('reportData2');
    });
  });

  describe('.tree()', function() {
    var mockTree;
    beforeEach(function() {
      mockTree = {
        rootNode: 'test-root',
        addNode: jasmine.createSpy('addNode')
      };

      spyOn(graphSupport, 'Tree').and.returnValue(mockTree);
    });

    it('builds a tree with the report data items', function() {
      var output = new GraphDataHelper().tree(['reportData1', 'reportData2'], 'pathProperty');

      expect(output).toEqual('test-root');

      expect(graphSupport.Tree).toHaveBeenCalledWith(null, 'pathProperty');
      expect(mockTree.addNode.calls.argsFor(0)[0]).toEqual('reportData1');
      expect(mockTree.addNode.calls.argsFor(1)[0]).toEqual('reportData2');
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
