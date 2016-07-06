require('d3');

var _ = require('lodash'),
    ko = require('knockout');

module.exports = function(config, dataTree, nodeProxy) {
  var pack = d3.layout.pack()
    .padding(2)
    .size([config.style.diameter, config.style.diameter])
    .value(nodeProxy.nodeValue);

  this.nodesArray = _.filter(pack.nodes(dataTree), nodeProxy.hasLayout);

  this.diameter = config.style.diameter;
  this.rootNode = dataTree;

  this.visibleNodes = ko.observable(this.nodesArray);
  this.currentFocus = ko.observable(dataTree);
};
