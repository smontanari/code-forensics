var d3 = require('d3'),
    _  = require('lodash');

var DiagramSupport = require('./diagram_support.js'),
    LegendModel    = require('./legend_model.js');

module.exports = function(config, series) {
  var diagramSupport = new DiagramSupport(config);
  var chartConfig = config.style;
  var axisConfig = config.axis;

  var actualWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right,
      actualHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;

  var keys = _.compact(_.map(series, 'name'));
  var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(keys);
  var legendDefinition;

  var diagramScale = diagramSupport.createScale(series, actualWidth, actualHeight);
  var plotLine = diagramSupport.createPlotLine(diagramScale);

  if (keys.length > 1) {
    legendDefinition = new LegendModel(config, keys, colorScale).legendDefinition;
  }

  this.chartDefinitions = [
    {
      name: 'main',
      properties: {
        attributes: { class: 'line-chart', width: chartConfig.width, height: chartConfig.height },
      },
      components: [
        {
          name: 'axes',
          componentType: 'axis',
          properties: { offset: { x: chartConfig.margin.left,  y: chartConfig.margin.top } },
          axisElements: [
            {
              name: 'X',
              properties: {
                attributes: { class: 'x axis' },
                offset: { y: actualHeight }
              },
              value: 'axisBottom',
              settings: {
                scale: diagramScale.x,
                tickFormat: axisConfig.x.tickFormat
              },
              innerElements: [
                {
                  type: 'text',
                  properties: {
                    attributes: {
                      class: 'label',
                      x: actualWidth + chartConfig.margin.left,
                      y: 20
                    },
                    text: axisConfig.x.label
                  }
                }
              ]
            },
            {
              name: 'Y',
              properties: {
                attributes: { class: 'y axis' }
              },
              value: 'axisLeft',
              settings: {
                scale: diagramScale.y
              },
              innerElements: [
                {
                  type: 'text',
                  properties: {
                    attributes: {
                      class: 'label',
                      y: 10 - chartConfig.margin.left,
                      dy: '.71em'
                    },
                    rotation: -90,
                    text: axisConfig.y.label
                  }
                }
              ]
            }
          ]
        },
        {
          name: 'plot-line',
          componentType: 'data',
          properties: {
            offset: { x: chartConfig.margin.left,  y: chartConfig.margin.top },
            attributes: { class: 'series' }
          },
          series: series,
          graphicElements: [
            {
              type: 'path',
              properties: {
                attributes: { class: 'line', d: plotLine },
                style: { stroke: function(d) { return colorScale(d.name); } }
              }
            }
          ]
        },
        legendDefinition
      ]
    }
  ];
};
