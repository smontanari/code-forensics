require('d3');

var _  = require('lodash'),
    ko = require('knockout');

module.exports = function(config, series) {
  var self = this;
  var height = config.style.height;

  var actualWidth = config.style.width - config.style.margin.left - config.style.margin.right;

  var actualHeight = d3.max([series.length/config.style.visibleBars * config.style.height, config.style.height]) - config.style.margin.top - config.style.margin.bottom;

  var visibleScale = d3.scale.linear()
    .domain([0, config.style.visibleBars])
    .range([0, config.style.height]);

  this.filterableSeries = series;
  this.visibleSeries = ko.observable(series);

  this.filterVisibleSeries = function(filters) {
    var regexpFilter = filters.pathFilter.outputValue();
    this.visibleSeries(_.filter(series, function(obj) {
      var objValue = obj[config.series.filterProperty];

      if (_.isRegExp(regexpFilter)) { return regexpFilter.test(objValue); }
      return objValue.includes(regexpFilter);
    }));
  };

  this.onUpdate = function(callback) {
    _.each([this.visibleSeries], function(observable) {
      observable.subscribe(_.wrap(self, callback));
    });
  };

  var seriesValues = _.map(series, config.series.valueProperty);

  var xScale = d3.scale.linear()
    .domain(d3.extent(seriesValues))
    .range([0, actualWidth]);

  var yScale = d3.scale.linear()
    .domain([0, seriesValues.length])
    .range([0, actualHeight]);

  var colorScaleFn = d3.scale.linear().range(config.style.colorRange).domain(d3.extent(seriesValues));

  this.chartDefinitions = [
    {
      name: 'xAxis',
      properties: {
        attributes: { class: 'chart-axis', width: config.style.width - config.style.margin.right, height: 21 },
        style: { position: 'absolute' }
      },
      axis: {
        properties: { offset: { x: config.style.margin.left, y: 20 } },
        axisElements: [
          {
            properties: {
              attributes: { class: 'x axis' },
            },
            value: {
              orient: 'top',
              scale: xScale,
              tickSize: 0
            }
          }
        ]
      }
    },
    {
      name: 'main',
      properties: {
        attributes: { class: 'bar-chart', width: config.style.width, height: actualHeight },
      },
      data: {
        properties: {
          offset: { x: config.style.margin.left, y: config.style.margin.top },
          attributes: { class: 'bars' }
        },
        series: _.ary(this.visibleSeries, 0),
        graphicElements: [
          {
            type: 'rect',
            properties: {
              style: { fill: function(d) { return colorScaleFn(d[config.series.valueProperty]); } },
              attributes: {
                width: function(d) { return xScale(d[config.series.valueProperty]); },
                height: config.style.barSize,
                x: 0,
                y: function(d, i) { return visibleScale(i) + config.style.barSize; }
              }
            }
          },
          {
            type: 'text',
            properties: {
              text: function(d) { return d[config.series.labelProperty]; },
              attributes: {
                x: 5,
                y: function(d, i) { return visibleScale(i) + 35; }
              }
            }
          }
        ]
      },
      updateStrategy: {
        method: 'resetData'
      }
    }
  ];
};
