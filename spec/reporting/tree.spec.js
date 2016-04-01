var tree = require_src('reporting/tree');

describe('TreeNode', function() {
  beforeEach(function() {
    this.subject = new tree.TreeNode('node/path');
  });

  it('creates a child tree when it does not exist', function() {
    var node = this.subject.getChildNode('some/child');

    expect(node.name).toEqual('child');
    expect(node.children).toEqual([]);
    expect(this.subject.children[0].name).toEqual('some');
    expect(this.subject.children[0].children).toEqual([node]);
  });

  it('supports children with the same name as any of the indirect parents', function() {
    var parent = this.subject.getChildNode('parent/node');
    var child = this.subject.getChildNode('parent/node/parent');

    expect(child).not.toBe(parent);
  });

  it('supports children with the same name as the direct parent node', function() {
    var parent = this.subject.getChildNode('parent');
    var child = this.subject.getChildNode('parent/parent');

    expect(child).not.toBe(parent);
  });

  it('returns an existing child node', function() {
    var node1 = this.subject.getChildNode('some/node/child');
    var node2 = this.subject.getChildNode('some').getChildNode('node/child');

    expect(node1).toBe(node2);
  });
});

describe('Tree', function() {
  beforeEach(function() {
    this.subject = new tree.Tree('root/path', 'path');
  });

  describe('.addNode', function() {
    var childNode;

    beforeEach(function() {
      childNode = this.subject.addNode({
        path: 'branch/child',
        stringProperty: 'test-property',
        numberProperty: 123
      });
    });

    it('returns the child node', function() {
      expect(childNode.name).toEqual('child');
      expect(childNode.children).toEqual([]);
      expect(childNode.stringProperty).toEqual('test-property');
      expect(childNode.numberProperty).toEqual(123);
    });

    it('generates the children tree structure', function() {
      expect(this.subject.rootNode.children.length).toEqual(1);
      expect(this.subject.rootNode.children[0].name).toEqual('branch');
      expect(this.subject.rootNode.children[0].children).toEqual([childNode]);
    });

    it('adds another child node', function() {
      var node = this.subject.addNode({
        path: 'branch/child/anotherChild',
        booleanProperty: true,
        numberProperty: 456
      });

      expect(childNode.children).toEqual([node]);
    });
  });
});
