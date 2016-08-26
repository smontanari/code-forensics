require('d3');

var _         = require('lodash'),
    NodeMixin = require('./node_mixin.js');

module.exports = function(size, nodeHelper) {
  this.toSeries = function(dataTree) {
    var pack = d3.layout.pack()
      .padding(2)
      .size([size, size])
      .value(nodeHelper.nodeValue);

    return _.filter(
      _.map(pack.nodes(dataTree), function(node) { return _.mixin(node, NodeMixin); }),
      function(node) { return node.hasLayout(); });
  };
};
