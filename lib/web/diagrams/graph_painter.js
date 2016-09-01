var _  = require('lodash'),
    ko = require('knockout');

var D3Chart = require('../d3_chart_components/d3_chart.js');

module.exports = function(svgContainerSelector) {
  var charts;

  this.draw = function(model) {
    charts = _.map(model.chartDefinitions, function(definition) {
      return new D3Chart(svgContainerSelector, definition);
    });
    if (ko.isObservable(model.visibleSeries)) {
      model.visibleSeries.subscribe(function() { _.invokeMap(charts, 'updateData'); });
    }
  };

  this.attachHandlers = function(handlersMap, model) {
    _.each(handlersMap, function(handlers, chartName) {
      var chart = _.find(charts, { name: chartName });
      if (chart) {
        _.invokeMap(handlers, 'bindTo', chart.svgDocument, model);
      }
    });
  };
};
