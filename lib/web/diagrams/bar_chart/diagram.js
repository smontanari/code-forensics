var ko = require('knockout');

var GraphPainter  = require('./graph_painter.js'),
    FilterHandler = require('./filter_handler.js'),
    DiagramModel = require('./diagram_model.js');

var BarChartDiagram = function(id, config, dataEventsHandler) {
  var filterHandler = new FilterHandler(config.filters);
  var painter = new GraphPainter(id, filterHandler);

  this.filters = config.filters;
  this.hasData = ko.observable(false);

  this.onData = function(data) {
    var series = dataEventsHandler.onLoad(data);

    this.hasData(series.length > 0);
    if (series.length === 0) { return; }

    var model = dataEventsHandler.onDataModel(new DiagramModel(config, series));
    painter.draw(model);
  };
};

BarChartDiagram.create = function(id, config, dataEventsHandler) {
  return new BarChartDiagram(id, config, dataEventsHandler);
};

module.exports = BarChartDiagram;
