/*global require_src*/
var TreeNode = require_src('graph_support/tree_node');

describe('TreeNode', function() {
  beforeEach(function() {
    this.subject = new TreeNode('node/path');
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
