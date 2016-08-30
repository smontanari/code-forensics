var _  = require('lodash'),
    ko = require('knockout');

var GraphPainter = require('./graph_painter.js');

module.exports = function(id, diagramHelper) {
  var graphPainter = new GraphPainter(id);

  var config = diagramHelper.configuration;

  this.filters = config.filters;
  this.cssClass = config.style.cssClass;
  this.width = config.style.width + 'px';
  this.height = config.style.height + 'px';
  this.hasData = ko.observable(false);

  this.onData = function(data) {
    var series = diagramHelper.processData(data);

    this.hasData(series.length > 0);
    if (series.length === 0) { return; }

    var model = diagramHelper.createModel(series);
    graphPainter.draw(model);

    model.onUpdate(graphPainter.update.bind(graphPainter));

    _.each(config.filters, function(f) {
      f.init(model.filterableSeries);
      f.outputValue.subscribe(function() {
        model.filterVisibleSeries(config.filters);
      });
    });

    graphPainter.attachHandlers(diagramHelper.graphHandlers, model);
  };
};
