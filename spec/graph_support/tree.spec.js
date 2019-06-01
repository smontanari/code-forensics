var Tree = require('graph_support/tree');

describe('Tree', function() {
  var subject;
  beforeEach(function() {
    subject = new Tree('/root/path', 'path');
  });

  describe('.addNode()', function() {
    var childNode;

    beforeEach(function() {
      childNode = subject.addNode({
        path: '/root/path/branch/child',
        stringProperty: 'test-property',
        numberProperty: 123
      });
    });

    it('has a root node with empty name', function() {
      expect(subject.rootNode.name).toBeUndefined();
    });

    it('returns the child node', function() {
      expect(childNode.name).toEqual('child');
      expect(childNode.children).toEqual([]);
      expect(childNode.stringProperty).toEqual('test-property');
      expect(childNode.numberProperty).toEqual(123);
    });

    it('generates the children tree structure', function() {
      expect(subject.rootNode.children).toHaveLength(1);
      expect(subject.rootNode.children[0].name).toEqual('branch');
      expect(subject.rootNode.children[0].children).toEqual([childNode]);
    });

    it('adds another child node', function() {
      var node = subject.addNode({
        path: '/root/path/branch/child/anotherChild',
        booleanProperty: true,
        numberProperty: 456
      });

      expect(childNode.children).toEqual([node]);
    });
  });
});
