var _  = require('lodash'),
    ko = require('knockout');

var DataModel      = require('./data_model.js'),
    NodeHelper     = require('./node_helper.js'),
    FilterHandler  = require('./filter_handler.js'),
    ZoomHandler    = require('./zoom_handler.js'),
    TooltipHandler = require('./tooltip_handler.js'),
    GraphPainter   = require('./graph_painter.js');

var CirclePackingDiagram = function(id, config, dataEventsHandler) {
  var nodeHelper = new NodeHelper(config);
  var filterHandler = new FilterHandler(config.filters, nodeHelper);
  var zoomHandler = new ZoomHandler(config.style.diameter, nodeHelper);
  var tooltipHandler = new TooltipHandler(nodeHelper);
  var graphPainter = new GraphPainter(id, nodeHelper, tooltipHandler, zoomHandler, filterHandler);

  var hasValidData = function(node) {
    if (_.isNumber(node[config.series.valueProperty])) {
      return true;
    } else if (node.children) {
      return _.some(node.children, hasValidData);
    }
    return false;
  };

  this.filters = config.filters;
  this.hasData = ko.observable(false);

  this.onData = function(data) {
    var dataTree = dataEventsHandler.onLoad(data);

    if (hasValidData(dataTree)) {
      this.hasData(true);

      var model = dataEventsHandler.onDataModel(new DataModel(config.style.diameter, dataTree, nodeHelper));
      graphPainter.draw(model);
    }
  };
};

CirclePackingDiagram.create = function(id, config, dataEventsHandler) {
  return new CirclePackingDiagram(id, config, dataEventsHandler);
};

module.exports = CirclePackingDiagram;
