require('d3');

var _ = require('lodash'),
    ko = require('knockout');

module.exports = function(config, series) {
  var self = this;
  var margin = config.style.margin;
  var height = config.style.height;

  var visibleScale = d3.scale.linear()
    .domain([0, config.style.visibleBars])
    .range([0, height - margin]);

  this.series = series;
  this.visibleSeries = ko.observable(series);
  this.width = config.style.width;

  this.height = d3.max([series.length/config.style.visibleBars * height, height]) - margin;

  var seriesValues = _.map(this.visibleSeries(), config.series.valueProperty);

  var xScale = d3.scale.linear()
    .domain(d3.extent(seriesValues))
    .range([0, self.width]);

  var yScale = d3.scale.linear()
    .domain([0, seriesValues.length])
    .range([0, self.height]);

  var colorScaleFn = d3.scale.linear().range(config.style.colorRange).domain(d3.extent(seriesValues));

  this.colorScale = function(d) { return colorScaleFn(d[config.series.valueProperty]); };

  this.axis = {
    x: {
      translate: 'translate(0,' + margin + ')',
      scale: function(d) { return xScale(d[config.series.valueProperty]); },
      value: d3.svg.axis()
        .orient('top')
        .scale(xScale)
        .outerTickSize(2)
        .innerTickSize(-self.height)
    },
    y: {
      translate: 'translate(0,' + margin + ')',
      scale: yScale,
      value: d3.svg.axis()
        .orient('left')
        .scale(yScale)
        .tickSize(0)
        .tickFormat('')
    }
  };

  this.bars = {
    size: config.style.barSize,
    rectGeometry: {
      x: 0,
      y: function(d, i) { return visibleScale(i) + config.style.barSize; }
    },
    textContent: function(d) {
      return d[config.series.labelProperty];
    },
    textGeometry: {
      x: 5,
      y: function(d, i) {
        return visibleScale(i) + config.style.barGap;
      }
    }
  };
};
