var ko = require('knockout');

var DiagramModel  = require('./diagram_model.js'),
    GraphPainter  = require('./graph_painter.js'),
    LegendHandler = require('./legend_handler.js');

var LineChartDiagram = function(id, config, dataEventsHandler) {
  var painter = new GraphPainter(id, new LegendHandler());

  this.hasData = ko.observable(false);

  this.onData = function(data) {
    var series = dataEventsHandler.onLoad(data);

    this.hasData(series.length > 0);
    if (series.length === 0) { return; }

    painter.draw(new DiagramModel(config, series));
  };
};

LineChartDiagram.create = function(id, config, dataEventsHandler) {
  return new LineChartDiagram(id, config, dataEventsHandler);
};

module.exports = LineChartDiagram;
