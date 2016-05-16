require('d3');

var _ = require('lodash'),
    ko = require('knockout');

var NodeHandler = require('./node_handler.js'),
    FilterHandler = require('./filter_handler.js'),
    ZoomHandler = require('./zoom_handler.js'),
    TooltipHandler = require('./tooltip_handler.js'),
    GraphPainter = require('./graph_painter.js');

var CirclePackingDiagram = function(diameter, nodeHandler, filterHandler, graphPainter, zoomHandler, tooltipHandler) {
  this.filters = filterHandler.filters;
  this.hasData = ko.observable(false);

  this.onData = function(dataTree) {
    var pack = d3.layout.pack()
      .padding(2)
      .size([diameter, diameter])
      .value(nodeHandler.nodeValue);

    var nodesArray = _.reject(pack.nodes(dataTree), function(d) {
      return _.isNaN(d.r) || _.isNaN(d.x) || _.isNaN(d.y);
    });

    this.hasData(nodesArray.length > 0);

    if (nodesArray.length === 0) { return; }

    var svgObject = graphPainter.draw(dataTree, nodesArray);

    zoomHandler.applyTo(dataTree, svgObject);
    tooltipHandler.applyTo(svgObject);
    filterHandler.applyTo(nodesArray,svgObject);
  };
};

CirclePackingDiagram.create = function(options) {
  var nodeHandler = new NodeHandler(options);
  var filterHandler = new FilterHandler(options.valueFilter, options.weightFilter, nodeHandler);
  var graphPainter = new GraphPainter(options.id, options.style.diameter, nodeHandler);
  var zoomHandler = new ZoomHandler(options.style.diameter, nodeHandler);
  var tooltipHandler = new TooltipHandler(nodeHandler, zoomHandler);

  return new CirclePackingDiagram(options.style.diameter, nodeHandler, filterHandler, graphPainter, zoomHandler, tooltipHandler);
};

module.exports = CirclePackingDiagram;
