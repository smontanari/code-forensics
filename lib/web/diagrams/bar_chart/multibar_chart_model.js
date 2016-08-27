require('d3');

var _ = require('lodash');

module.exports = function(config, series) {
  var styleConfig = config.style;
  var seriesConfig = config.series;

  var actualWidth = styleConfig.width - styleConfig.margin.left - styleConfig.margin.right,
      actualHeight = styleConfig.height - styleConfig.margin.top - styleConfig.margin.bottom;

  var x0 = seriesConfig.x0.scale.rangeRoundBands([0, actualWidth], 0.2);
  var x1 = seriesConfig.x1.scale;
  var y = seriesConfig.y.scale.range([actualHeight, 0]);
  var x0Value = function(d) { return d[seriesConfig.x0.valueProperty]; };
  var x1Value = function(d) { return d[seriesConfig.x1.valueProperty]; };
  var yValue = function(d) { return d[seriesConfig.y.valueProperty]; };
  var color = d3.scale.category10();

  var barNames = _.reduce(series, function(a, d) { return _.union(a, _.map(d.values, function(v) { return x1Value(v); })); }, []);
  x0.domain(series.map(x0Value));
  x1.domain(barNames).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(series, function(s) { return d3.max(_.map(s.values, yValue)); })]);

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: { class: 'bar-chart', width: styleConfig.width, height: styleConfig.height }
      },
      axis: {
        properties: { offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top } },
        axisElements: [
          {
            properties: {
              attributes: { class: 'x axis' },
              offset: { y: actualHeight }
            },
            value: {
              orient: 'bottom',
              scale: x0,
              tickFormat: styleConfig.tickFormat.x
            },
            labels: {
              rotation: 45,
              style: { 'text-anchor': 'start' }
            },
            title:{
              text: seriesConfig.x0.axisLabel,
              attributes: {
                class: 'label',
                x: actualWidth + 50,
                y: 10
              }
            }
          },
          {
            properties: {
              attributes: { class: 'y axis' }
            },
            value: {
              orient: 'left',
              scale: y
            },
            title: {
              text: seriesConfig.y.axisLabel,
              rotation: -90,
              attributes: {
                class: 'label',
                y: -40,
                dy: '.71em'
              }
            }
          }
        ]
      },
      legend: {
        properties: {
          attributes: { class: 'legend' },
          offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top },
        },
        series: barNames,
        graphicElements: [
          {
            type: 'rect',
            properties: {
              offset: function(d, i) { return { x: 15, y: i * 15 }; },
              attributes: {
                width: 10,
                height: 10,
                x: actualWidth + 25,
                y: 4
              },
              style: { fill: color }
            }
          },
          {
            type: 'text',
            properties: {
              offset: function(d, i) { return { x: 15, y: i * 15 }; },
              attributes: {
                x: actualWidth + 20,
                y: 9,
                dy: '.35em'
              },
              text: _.identity
            }
          }
        ]
      },
      data: {
        properties: {
          offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top }
        },
        series: series,
        group: {
          properties: {
            offset: function(d) { return { x: x0(x0Value(d)) }; },
            attributes: { class: 'series' }
          },
          series: function(d) { return d.values; },
          graphicElements: [
            {
              type: 'rect',
              properties: {
                attributes: {
                  width: x1.rangeBand(),
                  height: function(d) { return actualHeight - y(yValue(d)); },
                  x: function(d) { return x1(x1Value(d)); },
                  y: function(d) { return y(yValue(d)); }
                },
                style: { fill: function(d) { return color(x1Value(d)); } }
              }
            }
          ]
        }
      }
    }
  ];
};
