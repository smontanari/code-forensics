var d3 = require('d3'),
    _  = require('lodash');

module.exports = function(config, series) {
  var styleConfig = config.style;
  var seriesConfig = config.series;

  var x0Value = function(d) { return d[seriesConfig.x0.valueProperty]; };
  var x1Value = function(d) { return d[seriesConfig.x1.valueProperty]; };
  var yValue = function(d) { return d[seriesConfig.y.valueProperty]; };
  var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  var barNames = _.reduce(series, function(a, d) { return _.union(a, _.map(d.values, function(v) { return x1Value(v); })); }, []);
  var actualWidth = _.max([styleConfig.width, barNames.length * series.length * styleConfig.minBarWidth]),
      actualHeight = styleConfig.height - styleConfig.margin.top - styleConfig.margin.bottom;

  var x0Scale = seriesConfig.x0.scale
    .domain(series.map(x0Value))
    .range([0, actualWidth])
    .padding(0.2);

  var x1Scale = seriesConfig.x1.scale
    .domain(barNames)
    .range([0, x0Scale.bandwidth()]);

  var yScale = seriesConfig.y.scale
    .domain([0, d3.max(series, function(s) { return d3.max(_.map(s.values, yValue)); })])
    .range([actualHeight, 0]);

  this.chartDefinitions = [
    {
      name: 'yAxis',
      properties: {
        attributes: { class: 'fixed opaque', height: styleConfig.height, width: styleConfig.margin.left },
      },
      components: [
        {
          name: 'yAxis',
          componentType: 'axis',
          properties: {
            offset: { x: styleConfig.margin.left - 1,  y: styleConfig.margin.top },
            attributes: { class: 'y axis' }
          },
          behavior: 'axisLeft',
          settings: { scale: yScale },
          innerElements: [
            {
              elementType: 'text',
              properties: {
                rotation: -90,
                attributes: {
                  class: 'label',
                  x: 0,
                  y: 10 - styleConfig.margin.left,
                  dy: '.71em'
                },
                text: seriesConfig.y.axisLabel
              }
            }
          ]
        }
      ]
    },
    {
      name: 'legend',
      properties: {
        attributes: { class: 'fixed no-events', width: styleConfig.width },
      },
      components: [
        {
          name: 'legend-data',
          componentType: 'data',
          properties: {
            attributes: { class: 'legend' },
            offset: { x: styleConfig.width - styleConfig.margin.left - styleConfig.margin.right,  y: styleConfig.margin.top },
          },
          series: barNames,
          graphicElements: [
            {
              elementType: 'rect',
              properties: {
                offset: function(d, i) { return { x: 15, y: i * 15 }; },
                attributes: {
                  width: 10,
                  height: 10,
                  x: 25,
                  y: 4
                },
                style: { fill: colorScale }
              }
            },
            {
              elementType: 'text',
              properties: {
                offset: function(d, i) { return { x: 15, y: i * 15 }; },
                attributes: {
                  x: 20,
                  y: 9,
                  dy: '.35em'
                },
                text: _.identity
              }
            }
          ]
        }
      ]
    },
    {
      name: 'xAxis title',
      properties: {
        attributes: { class: 'fixed no-events', width: styleConfig.width, height: styleConfig.height },
      },
      innerElements: [
        {
          elementType: 'text',
          properties: {
            offset: { x: styleConfig.width - styleConfig.margin.right, y: styleConfig.height + styleConfig.margin.top - styleConfig.margin.bottom },
            attributes: {
              class: 'label'
            },
            text: seriesConfig.x0.axisLabel
          }
        }
      ]
    },
    {
      name: 'main',
      htmlWrapper: {
        elementType: 'div',
        properties: {
          attributes: { class: 'horizontal-wrapper' },
          style: { width: (styleConfig.width - styleConfig.margin.left - styleConfig.margin.right) + 'px' }
        }
      },
      properties: {
        attributes: { class: 'bar-chart', width: actualWidth + styleConfig.margin.left + styleConfig.margin.right, height: styleConfig.height }
      },
      components: [
        {
          name: 'xAxis',
          componentType: 'axis',
          properties: {
            offset: { x: styleConfig.margin.left,  y: styleConfig.height - styleConfig.margin.bottom },
            attributes: { class: 'x axis' }
          },
          behavior: 'axisBottom',
          settings: {
            scale: x0Scale,
            tickFormat: styleConfig.tickFormat.x
          },
        },
        {
          name: 'bars-plot',
          componentType: 'data',
          properties: {
            offset: { x: styleConfig.margin.left,  y: styleConfig.margin.top }
          },
          series: series,
          subDataElements: [
            {
              properties: {
                offset: function(d) { return { x: x0Scale(x0Value(d)) }; },
                attributes: { class: 'series' }
              },
              series: function(d) { return d.values; },
              graphicElements: [
                {
                  elementType: 'rect',
                  properties: {
                    attributes: {
                      width: x1Scale.bandwidth(),
                      height: function(d) { return actualHeight - yScale(yValue(d)); },
                      x: function(d) { return x1Scale(x1Value(d)); },
                      y: function(d) { return yScale(yValue(d)); }
                    },
                    style: { fill: function(d) { return colorScale(x1Value(d)); } }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ];
};
