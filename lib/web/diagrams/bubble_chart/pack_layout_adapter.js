var d3 = require('d3'),
    Q  = require('q'),
    _  = require('lodash');

module.exports = function(size, nodeHelper) {
  var packLayout = d3.pack()
    .padding(2)
    .size([size, size]);

  var normaliseData = function(data) {
    _.each(data.children, function(node) {
      node.name = nodeHelper.nodeName(node);
    });
  };

  this.toSeries = function(data) {
    normaliseData(data);

    var rootNode = d3.hierarchy(data);
    rootNode.sum(nodeHelper.nodeValue);
    packLayout(rootNode);

    return Q(rootNode.descendants());
  };
};
