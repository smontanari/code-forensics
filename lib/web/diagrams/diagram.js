var _  = require('lodash'),
    ko = require('knockout');

var GraphPainter = require('./graph_painter.js'),
    DataProxy    = require('./data_proxy.js');

module.exports = function(id, diagramSettings) {
  var graphPainter = new GraphPainter(id, diagramSettings.graphHandlers);
  var dataProxy = new DataProxy(diagramSettings.layoutAdapter, diagramSettings.dataTransform);

  this.filters = _.values(diagramSettings.configuration.filters);
  this.cssClass = diagramSettings.configuration.style.cssClass;
  this.width = diagramSettings.configuration.style.width + 'px';
  this.height = diagramSettings.configuration.style.height + 'px';
  this.hasData = ko.observable(false);
  this.model = ko.observable();

  this.onData = function(data) {
    var self = this;
    dataProxy.processData(data).then(function(series) {
      self.hasData(series.length > 0);
      if (series.length === 0) { return; }

      var model = new diagramSettings.Model(diagramSettings.configuration, series);

      graphPainter.draw(model);

      _.each(diagramSettings.configuration.filters, function(f) {
        f.init(model.seriesValues);
        f.outputValue.subscribe(function() {
          model.updateVisibleSeries(diagramSettings.configuration.filters);
        });
      });

      self.model(model);
    });
  };
};
