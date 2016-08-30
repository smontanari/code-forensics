module.exports = function(diagram) {
  this.configuration = diagram.configuration;
  this.graphHandlers = [];

  this.createModel = function(series) {
    return new diagram.Model(diagram.configuration, series);
  };

  this.processData = function(data) {
    var series = this.layoutAdapter ? this.layoutAdapter.toSeries(data) : data;
    return diagram.dataTransform ? diagram.dataTransform(series) : series;
  };
};
