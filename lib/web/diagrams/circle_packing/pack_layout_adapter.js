var d3 = require('d3'),
    _  = require('lodash');

var NodeMixin = {
  fullName: function() {
    return _.compact(_.map(_.reverse(this.ancestors()), function(node) {
      return node.data.name;
    })).join('/');
  },
  hasLayout: function() {
    return _.isNumber(this.r) && _.isNumber(this.x) && _.isNumber(this.y);
  },
  isRoot: function() {
    return _.isUndefined(this.parent);
  },
  isLeaf: function() {
    return _.isEmpty(this.children);
  }
};

module.exports = function(size, nodeHelper) {
  var packLayout = d3.pack()
    .padding(2)
    .size([size, size]);

  this.toSeries = function(dataTree) {
    var rootNode = d3.hierarchy(dataTree);
    rootNode.sum(nodeHelper.nodeValue);
    packLayout(rootNode);

    return _.filter(
      _.map(rootNode.descendants(), function(node) { return _.mixin(node, NodeMixin); }),
      function(node) { return node.hasLayout(); });
  };
};
