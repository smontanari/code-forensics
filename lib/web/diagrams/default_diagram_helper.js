var Q = require('q');

module.exports = function(diagram) {
  this.configuration = diagram.configuration;
  this.graphHandlers = [];
  this.layoutAdapter = { toSeries: Q };

  this.createModel = function(series) {
    return new diagram.Model(diagram.configuration, series);
  };

  this.processData = function(data) {
    return this.layoutAdapter.toSeries(data).then(function(series) {
      return diagram.dataTransform ? diagram.dataTransform(series) : series;
    });
  };
};
