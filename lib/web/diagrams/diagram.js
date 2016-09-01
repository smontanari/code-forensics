var _  = require('lodash'),
    ko = require('knockout');

var GraphPainter = require('./graph_painter.js');

module.exports = function(id, diagramHelper) {
  var graphPainter = new GraphPainter(id);

  var config = diagramHelper.configuration;

  this.filters = _.values(config.filters);
  this.cssClass = config.style.cssClass;
  this.width = config.style.width + 'px';
  this.height = config.style.height + 'px';
  this.hasData = ko.observable(false);

  this.onData = function(data) {
    var self = this;
    diagramHelper.processData(data).then(function(series) {
      self.hasData(series.length > 0);
      if (series.length === 0) { return; }

      var model = diagramHelper.createModel(series);

      graphPainter.draw(model);
      graphPainter.attachHandlers(diagramHelper.graphHandlers, model);

      _.each(config.filters, function(f) {
        f.init(model.seriesValues);
        f.outputValue.subscribe(function() {
          model.updateVisibleSeries(config.filters);
        });
      });
    });
  };
};
