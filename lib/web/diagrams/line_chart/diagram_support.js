var d3 = require('d3'),
    _  = require('lodash');

var ScaleDomainFactory = require('../../utils/scale_domain_factory.js');

module.exports = function(config) {
  var seriesConfig = config.series;

  var reduceAxisData = function(series, axis) {
    return _.reduce(series, function(values, s) {
      var allValues = values.concat(_.map(s.values, seriesConfig[axis].valueProperty));
      return _.uniqBy(allValues, seriesConfig[axis].valueCompareFn || _.identity);
    }, []);
  };

  this.createPlotLine = function(scale) {
    var line = d3.line().curve(config.plotLine.curve)
      .x(function(dataPoint) { return scale.x(dataPoint[seriesConfig.x.valueProperty]); })
      .y(function(dataPoint) { return scale.y(dataPoint[seriesConfig.y.valueProperty]); });

    return function(data) { return line(data.values); };
  };

  this.createScale = function(series, width, height) {
    var dataArrayX = reduceAxisData(series, 'x');
    var dataArrayY = reduceAxisData(series, 'y');
    return {
      x: seriesConfig.x.scale().range([0, width]).domain(ScaleDomainFactory(dataArrayX, seriesConfig.x.domainFactory)),
      y: seriesConfig.y.scale().range([height, 0]).domain(ScaleDomainFactory(dataArrayY, seriesConfig.y.domainFactory))
    };
  };
};
