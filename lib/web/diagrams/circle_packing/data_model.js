require('d3');

var _         = require('lodash'),
    ko        = require('knockout'),
    NodeMixin = require('./node_mixin.js');

module.exports = function(diameter, dataTree, nodeHelper) {
  var pack = d3.layout.pack()
    .padding(2)
    .size([diameter, diameter])
    .value(nodeHelper.nodeValue);

  this.nodesArray = _.filter(
    _.map(pack.nodes(dataTree), function(node) { return _.mixin(node, NodeMixin); }),
    function(node) { return node.hasLayout(); });

  this.diameter = diameter;
  this.rootNode = dataTree;

  this.visibleNodes = ko.observable(this.nodesArray);
  this.currentFocus = ko.observable(dataTree);
};
