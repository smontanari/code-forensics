var d3 = require('d3'),
    Q  = require('q'),
    _  = require('lodash');

module.exports = function(width, height, nodeHelper) {
  var treemap = d3.treemap()
    .size([width, height])
    .round(false);


  this.toSeries = function(data) {
    var rootNode = d3.hierarchy(data).sum(nodeHelper.nodeValue);
    treemap(rootNode);

    return Q(rootNode.descendants());
  };
};
