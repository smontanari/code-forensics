var _ = require('lodash');

var TreeNode = function(nodeName) {
  this.name = nodeName;
  this.children = [];
};

TreeNode.prototype.getChildNode = function(nodeName) {
  return _.reduce(nodeName.split('/'), function(node, name) {
    var child = _.find(node.children, function(childNode) { return childNode.name === name; });
    if (_.isUndefined(child)) {
      child = new TreeNode(name);
      node.children.push(child);
    }
    return child;
  }, this);
};

var Tree = function(rootPathName, nameProperty) {
  this.rootNode = new TreeNode(rootPathName);

  this.addNode = function(item) {
    var name = item[nameProperty];
    var childNode = this.rootNode.getChildNode(name);
    _.forOwn(item, function(value, key) {
      if (key === nameProperty) { return; }
      childNode[key] = value;
    });
    return childNode;
  };
};

module.exports = {
  TreeNode: TreeNode,
  Tree: Tree
};
