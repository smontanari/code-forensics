require('d3');

var _ = require('lodash'),
    ko = require('knockout');

module.exports = function(diameter, dataTree, nodeProxy) {
  var pack = d3.layout.pack()
    .padding(2)
    .size([diameter, diameter])
    .value(nodeProxy.nodeValue);

  this.nodesArray = _.filter(pack.nodes(dataTree), nodeProxy.hasLayout);

  this.diameter = diameter;
  this.rootNode = dataTree;

  this.visibleNodes = ko.observable(this.nodesArray);
  this.currentFocus = ko.observable(dataTree);
};
