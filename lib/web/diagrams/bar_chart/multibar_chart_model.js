var d3 = require('d3'),
    _  = require('lodash');

module.exports = function(config, series) {
  var styleConfig = config.style;
  var seriesConfig = config.series;

  var actualWidth = styleConfig.width - styleConfig.margin.left - styleConfig.margin.right,
      actualHeight = styleConfig.height - styleConfig.margin.top - styleConfig.margin.bottom;

  var x0Value = function(d) { return d[seriesConfig.x0.valueProperty]; };
  var x1Value = function(d) { return d[seriesConfig.x1.valueProperty]; };
  var yValue = function(d) { return d[seriesConfig.y.valueProperty]; };
  var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  var barNames = _.reduce(series, function(a, d) { return _.union(a, _.map(d.values, function(v) { return x1Value(v); })); }, []);
  var x0 = seriesConfig.x0.scale
    .domain(series.map(x0Value))
    .range([0, actualWidth])
    .padding(0.2);
  var x1 = seriesConfig.x1.scale
    .domain(barNames)
    .range([0, x0.bandwidth()]);
  var y = seriesConfig.y.scale
    .domain([0, d3.max(series, function(s) { return d3.max(_.map(s.values, yValue)); })])
    .range([actualHeight, 0]);

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
            value: 'axisBottom',
            settings: {
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
            value: 'axisLeft',
            settings: { scale: y },
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
              style: { fill: colorScale }
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
                  width: x1.bandwidth(),
                  height: function(d) { return actualHeight - y(yValue(d)); },
                  x: function(d) { return x1(x1Value(d)); },
                  y: function(d) { return y(yValue(d)); }
                },
                style: { fill: function(d) { return colorScale(x1Value(d)); } }
              }
            }
          ]
        }
      }
    }
  ];
};
