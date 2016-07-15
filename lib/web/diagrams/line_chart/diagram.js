var ko = require('knockout');

var DiagramHelper = require('./diagram_helper.js'),
    GraphPainter  = require('./graph_painter.js'),
    LegendHandler = require('./legend_handler.js');

var LineChartDiagram = function(helper, painter, legendHandler, dataEventsHandler) {
  this.hasData = ko.observable(false);

  this.onData = function(data) {
    var series = dataEventsHandler.onLoad(data);

    this.hasData(series.length > 0);
    if (series.length === 0) { return; }

    helper.setDataDomain(series);
    var svgObject = painter.draw(series);
    legendHandler.applyTo(svgObject);
  };
};

LineChartDiagram.create = function(id, config, dataEventsHandler) {
  var helper = new DiagramHelper(config);
  var graphPainter = new GraphPainter(id, config.style.width, config.style.height, helper);
  var legendHandler = new LegendHandler(helper);
  return new LineChartDiagram(helper, graphPainter, legendHandler, dataEventsHandler);
};

module.exports = LineChartDiagram;
