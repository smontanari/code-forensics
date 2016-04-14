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

module.exports = TreeNode;
