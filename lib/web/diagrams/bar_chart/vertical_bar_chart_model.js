var d3 = require('d3'),
    _  = require('lodash'),
    ko = require('knockout');

module.exports = function(config, series) {
  var actualWidth = config.style.width - config.style.margin.left - config.style.margin.right;
  var actualHeight = d3.max([series.length/config.style.visibleBars * config.style.height, config.style.height]) - config.style.margin.top - config.style.margin.bottom;

  this.visibleSeries = ko.observable(series);

  this.updateVisibleSeries = function(filters) {
    var regexpFilter = filters.pathFilter.outputValue();
    this.visibleSeries(_.filter(series, function(obj) {
      var objValue = obj[config.series.x.valueProperty];

      if (_.isRegExp(regexpFilter)) { return regexpFilter.test(objValue); }
      return objValue.includes(regexpFilter);
    }));
  };

  var xScale = config.series.x.scale
    .domain([0, config.style.visibleBars])
    .range([0, config.style.height]);

  var yScale = config.series.y.scale
    .domain(d3.extent(_.map(series, config.series.y.valueProperty)))
    .range([0, actualWidth]);

  this.chartDefinitions = [
    {
      name: 'yAxis',
      properties: {
        attributes: { class: 'chart-axis', width: config.style.width - config.style.margin.right, height: 21 },
        style: { position: 'absolute' }
      },
      axis: {
        properties: { offset: { x: config.style.margin.left, y: 20 } },
        axisElements: [
          {
            properties: {
              attributes: { class: 'y axis' },
            },
            value: 'axisTop',
            settings: { scale: yScale }
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
              style: { fill: config.style.barColor },
              attributes: {
                width: function(d) { return yScale(d[config.series.y.valueProperty]); },
                height: config.style.barSize,
                x: 0,
                y: function(d, i) { return xScale(i) + config.style.barSize; }
              }
            }
          },
          {
            type: 'text',
            properties: {
              text: function(d) { return d[config.series.x.labelProperty]; },
              attributes: {
                x: 5,
                y: function(d, i) { return xScale(i) + 35; }
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
