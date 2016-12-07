var _  = require('lodash'),
    ko = require('knockout');

var GraphPainter = require('./graph_painter.js'),
    FiltersProxy = require('./filters_proxy.js'),
    DataProxy    = require('./data_proxy.js');

module.exports = function(id, diagramSettings) {
  var graphPainter = new GraphPainter(id, diagramSettings.graphHandlers);
  var dataProxy = new DataProxy(diagramSettings.layoutAdapter, diagramSettings.dataTransform);
  var filtersProxy = new FiltersProxy(diagramSettings.filters);

  this.cssClass = diagramSettings.configuration.style.cssClass;
  this.width = diagramSettings.configuration.style.width + 'px';
  this.height = diagramSettings.configuration.style.height + 'px';
  this.hasData = ko.observable(false);
  this.hasFilters = ko.observable(false);
  this.model = ko.observable();

  this.onData = function(data) {
    var self = this;
    dataProxy.processData(data).then(function(series) {
      self.hasData((_.isArray(series) && series.length > 0) || _.isObject(series));
      if (!self.hasData()) { return; }

      var model = new diagramSettings.Model(diagramSettings.configuration, series);

      self.filters = filtersProxy.initializeFilters(series, model);
      self.hasFilters(!_.isEmpty(self.filters));

      graphPainter.draw(model);
      self.model(model);
    });
  };
};
