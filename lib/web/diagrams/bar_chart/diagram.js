var ko = require('knockout');

var GraphPainter  = require('./graph_painter.js'),
    FilterHandler = require('./filter_handler.js'),
    DiagramModel = require('./diagram_model.js');

var BarChartDiagram = function(config) {
  var filterHandler = new FilterHandler(config.filters);
  var painter = new GraphPainter(config.id, filterHandler);

  this.filters = config.filters;
  this.hasData = ko.observable(false);

  this.onData = function(series) {
    this.hasData(series.length > 0);
    if (series.length === 0) { return; }

    painter.draw(new DiagramModel(config, series));
  };
};

BarChartDiagram.create = function(config) {
  return new BarChartDiagram(config);
};

module.exports = BarChartDiagram;
