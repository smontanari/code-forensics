var ko = require('knockout');

var DiagramHelper = require('./diagram_helper.js'),
    GraphPainter  = require('./graph_painter.js'),
    LegendHandler = require('./legend_handler.js');

var LineChartDiagram = function(helper, painter) {
  this.hasData = ko.observable(false);

  this.onData = function(series) {
    this.hasData(series.length > 0);
    if (series.length === 0) { return; }

    helper.setDataDomain(series);
    var svgObject = painter.draw(series);
    legendHandler.applyTo(svgObject);
  };
};

LineChartDiagram.create = function(options) {
  var helper = new DiagramHelper(options);
  var graphPainter = new GraphPainter(options.id, options.style.width, options.style.height, helper);
  var legendHandler = new LegendHandler(helper);
  return new LineChartDiagram(helper, graphPainter, legendHandler);
};

module.exports = LineChartDiagram;
