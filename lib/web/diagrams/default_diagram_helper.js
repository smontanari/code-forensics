var _ = require('lodash');

module.exports = function(diagram) {
  this.configuration = diagram.configuration;
  this.seriesAdapter = { toSeries: _.identity };

  this.graphHandlers = [];

  this.createModel = function(series) {
    return new diagram.Model(diagram.configuration, series);
  };

  this.processData = function(data) {
    var transform = diagram.dataTransform || _.identity;
    return transform(this.seriesAdapter.toSeries(data));
  };
};
