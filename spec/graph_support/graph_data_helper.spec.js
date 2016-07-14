var graphDataHelper = require_src('tasks/helpers/graph_data_helper'),
    graphSupport = require_src('graph_support');

describe('graphDataHelper', function() {
  describe('.hotspotDataTree()', function() {
    var mockTree;
    beforeEach(function() {
      mockTree = jasmine.createSpyObj('tree', ['withItem', 'rootNode']);
      spyOn(graphSupport, 'WeightedTree').and.returnValue(mockTree);
      mockTree.rootNode.and.returnValue('test-root');
    });

    it('builds a weighted tree with the report data items', function() {
      var output = graphDataHelper.hotspotDataTree(['reportData1', 'reportData2']);

      expect(output).toEqual('test-root');

      expect(graphSupport.WeightedTree).toHaveBeenCalledWith(null, 'path', {weightedProperty: 'revisions', normalised: true});
      expect(mockTree.withItem.calls.argsFor(0)[0]).toEqual('reportData1');
      expect(mockTree.withItem.calls.argsFor(1)[0]).toEqual('reportData2');
    });
  });
});
