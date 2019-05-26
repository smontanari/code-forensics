var TreeNode = require('graph_support/tree_node');

describe('TreeNode', function() {
  var subject;
  beforeEach(function() {
    subject = new TreeNode('node/path');
  });

  it('creates a child tree when it does not exist', function() {
    var node = subject.getChildNode('some/child');

    expect(node.name).toEqual('child');
    expect(node.children).toEqual([]);
    expect(subject.children[0].name).toEqual('some');
    expect(subject.children[0].children).toEqual([node]);
  });

  it('supports children with the same name as any of the indirect parents', function() {
    var parent = subject.getChildNode('parent/node');
    var child = subject.getChildNode('parent/node/parent');

    expect(child).not.toBe(parent);
  });

  it('supports children with the same name as the direct parent node', function() {
    var parent = subject.getChildNode('parent');
    var child = subject.getChildNode('parent/parent');

    expect(child).not.toBe(parent);
  });

  it('returns an existing child node', function() {
    var node1 = subject.getChildNode('some/node/child');
    var node2 = subject.getChildNode('some').getChildNode('node/child');

    expect(node1).toBe(node2);
  });
});
