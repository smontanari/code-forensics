var _ = require('lodash');

var D3Chart = require('../d3_chart_components/d3_chart.js');

module.exports = function(svgContainerSelector) {
  var charts;

  this.draw = function(model) {
    charts = _.map(model.chartDefinitions, function(definition) {
      return new D3Chart(svgContainerSelector, definition);
    });
  };

  this.update = function() {
    _.invokeMap(charts, 'updateData');
  };

  this.repaint = function(model) {
    if (_.isPlainObject(model.repaintStrategy)) {
      _.each(charts, function(chart) {
        chart[model.repaintStrategy.method].apply(chart, model.repaintStrategy.arguments);
      });
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
